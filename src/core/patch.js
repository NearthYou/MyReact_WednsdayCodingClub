import { createDomFromVNode, removeDomProp, setDomProps } from "./render.js";
import { isRootPath } from "./path-utils.js";

const TEXT_NODE = 3;
const COMMENT_NODE = 8;

function isIgnorableNode(node) {
  if (!node) {
    return true;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return true;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return (node.nodeValue ?? "").trim() === "";
  }

  return false;
}

function getRenderableChildNodes(node) {
  return Array.from(node?.childNodes ?? []).filter((childNode) => !isIgnorableNode(childNode));
}

function getLastPathIndex(path = []) {
  if (!Array.isArray(path) || path.length === 0) {
    return -1;
  }

  return path[path.length - 1];
}

function compareRemovePatches(a, b) {
  const aPath = Array.isArray(a?.path) ? a.path : [];
  const bPath = Array.isArray(b?.path) ? b.path : [];

  if (aPath.length !== bPath.length) {
    return bPath.length - aPath.length;
  }

  const maxLength = Math.max(aPath.length, bPath.length);

  for (let index = 0; index < maxLength; index += 1) {
    const aIndex = aPath[index] ?? -1;
    const bIndex = bPath[index] ?? -1;

    if (aIndex !== bIndex) {
      return bIndex - aIndex;
    }
  }

  return 0;
}

function orderPatches(patches = []) {
  const removePatches = [];
  const replacePatches = [];
  const textPatches = [];
  const propsPatches = [];
  const createPatches = [];

  for (const patch of patches) {
    switch (patch?.type) {
      case "REMOVE":
        removePatches.push(patch);
        break;
      case "REPLACE":
        replacePatches.push(patch);
        break;
      case "TEXT":
        textPatches.push(patch);
        break;
      case "PROPS":
        propsPatches.push(patch);
        break;
      case "CREATE":
        createPatches.push(patch);
        break;
      default:
        break;
    }
  }

  removePatches.sort(compareRemovePatches);

  return [
    ...removePatches,
    ...replacePatches,
    ...textPatches,
    ...propsPatches,
    ...createPatches
  ];
}

export function applyPatches(rootElement, patches = []) {
  let currentRoot = rootElement ?? null;

  for (const patch of orderPatches(Array.isArray(patches) ? patches : [])) {
    currentRoot = applyPatch(currentRoot, patch);
  }

  return currentRoot;
}

export function applyPatch(rootElement, patch) {
  if (!patch || !patch.type) {
    return rootElement ?? null;
  }

  switch (patch.type) {
    case "CREATE": {
      if (isRootPath(patch.path)) {
        return rootElement ?? null;
      }

      const parentNode = getParentNodeByPath(rootElement, patch.path);

      if (!parentNode || !patch.node) {
        return rootElement ?? null;
      }

      const nextNode = createDomFromVNode(patch.node);

      if (!nextNode) {
        return rootElement ?? null;
      }

      const insertIndex = getLastPathIndex(patch.path);
      const renderableChildren = getRenderableChildNodes(parentNode);
      const referenceNode =
        typeof insertIndex === "number" && insertIndex >= 0
          ? renderableChildren[insertIndex] ?? null
          : null;

      parentNode.insertBefore(nextNode, referenceNode);

      return rootElement ?? null;
    }

    case "REMOVE": {
      const targetNode = getNodeByPath(rootElement, patch.path);

      if (!targetNode || !targetNode.parentNode) {
        return rootElement ?? null;
      }

      targetNode.parentNode.removeChild(targetNode);

      if (isRootPath(patch.path)) {
        return null;
      }

      return rootElement ?? null;
    }

    case "REPLACE": {
      const targetNode = getNodeByPath(rootElement, patch.path);

      if (!targetNode || !targetNode.parentNode || !patch.node) {
        return rootElement ?? null;
      }

      const nextNode = createDomFromVNode(patch.node);

      if (!nextNode) {
        return rootElement ?? null;
      }

      targetNode.parentNode.replaceChild(nextNode, targetNode);

      if (isRootPath(patch.path)) {
        return nextNode;
      }

      return rootElement ?? null;
    }

    case "TEXT": {
      const targetNode = getNodeByPath(rootElement, patch.path);

      if (!targetNode) {
        return rootElement ?? null;
      }

      targetNode.nodeValue = String(patch.text ?? "");

      return rootElement ?? null;
    }

    case "PROPS": {
      const targetNode = getNodeByPath(rootElement, patch.path);

      if (
        !targetNode ||
        typeof targetNode.removeAttribute !== "function" ||
        typeof targetNode.setAttribute !== "function"
      ) {
        return rootElement ?? null;
      }

      const removeProps = Array.isArray(patch.props?.remove) ? patch.props.remove : [];

      for (const name of removeProps) {
        if (!name) {
          continue;
        }

        removeDomProp(targetNode, name);
      }

      setDomProps(targetNode, patch.props?.set ?? {});

      return rootElement ?? null;
    }

    default:
      return rootElement ?? null;
  }
}

export function getNodeByPath(rootElement, path = []) {
  if (!rootElement || !Array.isArray(path)) {
    return null;
  }

  if (isRootPath(path)) {
    return rootElement;
  }

  let currentNode = rootElement;

  for (const index of path) {
    const renderableChildren = getRenderableChildNodes(currentNode);

    if (index < 0 || index >= renderableChildren.length) {
      return null;
    }

    currentNode = renderableChildren[index];
  }

  return currentNode ?? null;
}

export function getParentNodeByPath(rootElement, path = []) {
  if (!rootElement || !Array.isArray(path)) {
    return null;
  }

  if (isRootPath(path)) {
    return rootElement.parentNode ?? null;
  }

  if (path.length === 1) {
    return rootElement;
  }

  return getNodeByPath(rootElement, path.slice(0, -1));
}
