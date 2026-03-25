import { assertDomNode, isEventAttribute } from "./dom-utils.js";

function getDocument() {
  if (typeof document === "undefined") {
    throw new Error("document is not available.");
  }

  return document;
}

export function createDomFromVNode(vNode) {
  if (!vNode) {
    return null;
  }

  const currentDocument = getDocument();

  if (vNode.nodeType === "text") {
    return currentDocument.createTextNode(String(vNode.text ?? ""));
  }

  if (vNode.nodeType !== "element") {
    throw new Error(`Unsupported vnode nodeType: ${vNode.nodeType}`);
  }

  const element = currentDocument.createElement(vNode.tag);

  setDomProps(element, vNode.props);

  for (const childVNode of Array.isArray(vNode.children) ? vNode.children : []) {
    const childNode = createDomFromVNode(childVNode);

    if (childNode) {
      element.appendChild(childNode);
    }
  }

  return element;
}

export function renderVNode(vNode, container) {
  assertDomNode(container, "container");

  const renderedNode = createDomFromVNode(vNode);

  if (renderedNode) {
    container.replaceChildren(renderedNode);
  } else {
    container.replaceChildren();
  }

  return renderedNode;
}

export function setDomProps(element, props = {}) {
  assertDomNode(element, "element");

  for (const [name, value] of Object.entries(props)) {
    if (!name || isEventAttribute(name)) {
      continue;
    }

    if (value === null || value === undefined || value === false) {
      element.removeAttribute(name);
      continue;
    }

    if (value === true) {
      element.setAttribute(name, "");
      continue;
    }

    element.setAttribute(name, String(value));
  }

  return element;
}
