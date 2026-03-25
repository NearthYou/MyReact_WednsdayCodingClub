import { assertDomNode, isEventAttribute, isFunctionEventProp } from "./dom-utils.js";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

const BOOLEAN_ATTRIBUTES = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);

function isIgnoredText(text) {
  return typeof text === "string" && text.trim() === "";
}

function getAttributeValue(attribute) {
  if (!attribute || !attribute.name) {
    return "";
  }

  if (BOOLEAN_ATTRIBUTES.has(attribute.name.toLowerCase())) {
    return true;
  }

  return String(attribute.value ?? "");
}

export function domToVNode(domNode) {
  assertDomNode(domNode);

  if (domNode.nodeType === COMMENT_NODE) {
    return null;
  }

  if (domNode.nodeType === TEXT_NODE) {
    const text = domNode.nodeValue ?? "";

    if (isIgnoredText(text)) {
      return null;
    }

    return {
      nodeType: "text",
      text
    };
  }

  if (domNode.nodeType !== ELEMENT_NODE) {
    return null;
  }

  const props = {};

  for (const attribute of Array.from(domNode.attributes ?? [])) {
    const name = attribute.name;

    if (!name || isEventAttribute(name)) {
      continue;
    }

    props[name] = getAttributeValue(attribute);
  }

  return {
    nodeType: "element",
    tag: String(domNode.tagName ?? "").toLowerCase(),
    props,
    children: domChildrenToVNodes(domNode)
  };
}

export function domChildrenToVNodes(domNode) {
  assertDomNode(domNode);

  const children = [];

  for (const childNode of Array.from(domNode.childNodes ?? [])) {
    const childVNode = domToVNode(childNode);

    if (childVNode) {
      children.push(childVNode);
    }
  }

  return children;
}

export function cloneVNode(vNode) {
  if (!vNode) {
    return vNode;
  }

  if (vNode.nodeType === "text") {
    return {
      nodeType: "text",
      text: String(vNode.text ?? "")
    };
  }

  return {
    nodeType: "element",
    tag: String(vNode.tag ?? ""),
    props: { ...(vNode.props ?? {}) },
    children: Array.isArray(vNode.children) ? vNode.children.map(cloneVNode) : []
  };
}

function mergeEventProps(sourceProps = {}, targetProps = {}) {
  const nextProps = { ...(targetProps ?? {}) };
  const targetEventNames = new Set(
    Object.entries(targetProps ?? {})
      .filter(([name, value]) => isFunctionEventProp(name, value))
      .map(([name]) => name.toLowerCase())
  );

  for (const [name, value] of Object.entries(sourceProps ?? {})) {
    if (!isFunctionEventProp(name, value)) {
      continue;
    }

    if (targetEventNames.has(name.toLowerCase())) {
      continue;
    }

    nextProps[name] = value;
  }

  return nextProps;
}

export function mergeRetainedEventProps(sourceVNode, targetVNode) {
  if (!targetVNode) {
    return targetVNode;
  }

  if (targetVNode.nodeType === "text") {
    return {
      nodeType: "text",
      text: String(targetVNode.text ?? "")
    };
  }

  const baseNode = {
    nodeType: "element",
    tag: String(targetVNode.tag ?? ""),
    props: { ...(targetVNode.props ?? {}) },
    children: Array.isArray(targetVNode.children) ? targetVNode.children.map(cloneVNode) : []
  };

  if (
    !sourceVNode ||
    sourceVNode.nodeType !== "element" ||
    sourceVNode.tag !== targetVNode.tag
  ) {
    return baseNode;
  }

  return {
    nodeType: "element",
    tag: String(targetVNode.tag ?? ""),
    props: mergeEventProps(sourceVNode.props, targetVNode.props),
    children: Array.isArray(targetVNode.children)
      ? targetVNode.children.map((childVNode, index) =>
          mergeRetainedEventProps(sourceVNode.children?.[index], childVNode)
        )
      : []
  };
}
