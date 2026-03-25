const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

class FakeNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
  }

  appendChild(childNode) {
    if (childNode.parentNode) {
      childNode.parentNode.removeChild(childNode);
    }

    this.childNodes.push(childNode);
    childNode.parentNode = this;

    return childNode;
  }

  removeChild(childNode) {
    const childIndex = this.childNodes.indexOf(childNode);

    if (childIndex === -1) {
      throw new Error("childNode is not a child of this node.");
    }

    this.childNodes.splice(childIndex, 1);
    childNode.parentNode = null;

    return childNode;
  }
}

class FakeTextNode extends FakeNode {
  constructor(value = "") {
    super(TEXT_NODE);
    this.nodeValue = String(value);
  }
}

class FakeElement extends FakeNode {
  constructor(tagName) {
    super(ELEMENT_NODE);
    this.tagName = String(tagName).toUpperCase();
    this.attributes = [];
  }

  setAttribute(name, value) {
    const attributeName = String(name);
    const existingAttribute = this.attributes.find(
      (attribute) => attribute.name === attributeName,
    );

    if (existingAttribute) {
      existingAttribute.value = String(value);
      return;
    }

    this.attributes.push({
      name: attributeName,
      value: String(value),
    });
  }

  removeAttribute(name) {
    const attributeName = String(name);
    const attributeIndex = this.attributes.findIndex(
      (attribute) => attribute.name === attributeName,
    );

    if (attributeIndex === -1) {
      return;
    }

    this.attributes.splice(attributeIndex, 1);
  }

  replaceChildren(...nextChildren) {
    for (const childNode of [...this.childNodes]) {
      this.removeChild(childNode);
    }

    for (const childNode of nextChildren) {
      if (childNode) {
        this.appendChild(childNode);
      }
    }
  }
}

export function installFakeDomGlobals() {
  const previousDocument = globalThis.document;

  globalThis.document = {
    createElement(tagName) {
      return new FakeElement(tagName);
    },
    createTextNode(value) {
      return new FakeTextNode(value);
    },
  };

  return {
    document: globalThis.document,
    restore() {
      if (typeof previousDocument === "undefined") {
        delete globalThis.document;
      } else {
        globalThis.document = previousDocument;
      }
    },
  };
}

export function serializeNode(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType === TEXT_NODE) {
    return {
      nodeType: "text",
      text: String(node.nodeValue ?? ""),
    };
  }

  return {
    nodeType: "element",
    tag: String(node.tagName ?? "").toLowerCase(),
    props: Object.fromEntries(
      Array.from(node.attributes ?? []).map((attribute) => [
        attribute.name,
        attribute.value,
      ]),
    ),
    children: Array.from(node.childNodes ?? []).map(serializeNode),
  };
}
