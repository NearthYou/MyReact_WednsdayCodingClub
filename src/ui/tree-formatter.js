function withSpaceLabel(label, summary) {
  return label ? `${label} ${summary}` : summary;
}

function withColonLabel(label, summary) {
  return label ? `${label}: ${summary}` : summary;
}

function isObjectLike(value) {
  return value !== null && typeof value === "object";
}

function isVNode(value) {
  return (
    isObjectLike(value) &&
    (value.nodeType === "element" || value.nodeType === "text")
  );
}

function isPatch(value) {
  return isObjectLike(value) && typeof value.type === "string" && Array.isArray(value.path);
}

function formatPrimitive(value) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (Number.isNaN(value)) {
    return "NaN";
  }

  return String(value);
}

function createNode(text, children = []) {
  return { text, children };
}

function formatPath(path = []) {
  if (!Array.isArray(path) || path.length === 0) {
    return "root";
  }

  return `root > ${path.join(" > ")}`;
}

function renderTree(node) {
  const lines = [];

  function visit(currentNode, indent = "", isLast = true, isRoot = false) {
    const linePrefix = isRoot ? "" : `${indent}${isLast ? "└─ " : "├─ "}`;

    lines.push(`${linePrefix}${currentNode.text}`);

    const nextIndent = isRoot ? "" : `${indent}${isLast ? "   " : "│  "}`;

    currentNode.children.forEach((childNode, index) => {
      visit(childNode, nextIndent, index === currentNode.children.length - 1, false);
    });
  }

  visit(node, "", true, true);

  return lines.join("\n");
}

function createArrayNode(label, items, trail, options = {}) {
  if (trail.has(items)) {
    return createNode(withColonLabel(label, "[Circular]"));
  }

  const summary = items.length === 0 ? "[]" : `[${items.length}]`;

  if (items.length === 0) {
    return createNode(withSpaceLabel(label, summary));
  }

  trail.add(items);

  try {
    return createNode(
      withSpaceLabel(label, summary),
      items.map((item, index) => {
        const itemLabel =
          options.currentIndex === index ? `[${index}] current` : `[${index}]`;

        return createValueNode(itemLabel, item, trail);
      }),
    );
  } finally {
    trail.delete(items);
  }
}

function createObjectNode(label, value, trail) {
  if (trail.has(value)) {
    return createNode(withColonLabel(label, "[Circular]"));
  }

  const entries = Object.entries(value);
  const summary = entries.length === 0 ? "{}" : `{${entries.length}}`;

  if (entries.length === 0) {
    return createNode(withSpaceLabel(label, summary));
  }

  trail.add(value);

  try {
    return createNode(
      withSpaceLabel(label, summary),
      entries.map(([key, childValue]) => createValueNode(key, childValue, trail)),
    );
  } finally {
    trail.delete(value);
  }
}

function createVNodeNode(label, value, trail) {
  if (trail.has(value)) {
    return createNode(withColonLabel(label, "[Circular]"));
  }

  if (value.nodeType === "text") {
    return createNode(withColonLabel(label, `text ${formatPrimitive(String(value.text ?? ""))}`));
  }

  trail.add(value);

  try {
    const props = isObjectLike(value.props) ? value.props : {};
    const children = Array.isArray(value.children) ? value.children : [];

    return createNode(withColonLabel(label, `element <${String(value.tag ?? "")}>`), [
      createObjectNode("props", props, trail),
      createArrayNode("children", children, trail),
    ]);
  } finally {
    trail.delete(value);
  }
}

function createPatchNode(label, value, trail) {
  if (trail.has(value)) {
    return createNode(withColonLabel(label, "[Circular]"));
  }

  trail.add(value);

  try {
    const children = [];
    const handledKeys = new Set(["type", "path", "props", "text", "node"]);

    if ("props" in value) {
      children.push(createValueNode("props", value.props, trail));
    }

    if ("text" in value) {
      children.push(createValueNode("text", value.text, trail));
    }

    if ("node" in value) {
      children.push(createValueNode("node", value.node, trail));
    }

    Object.entries(value).forEach(([key, childValue]) => {
      if (!handledKeys.has(key)) {
        children.push(createValueNode(key, childValue, trail));
      }
    });

    return createNode(withColonLabel(label, `${value.type} @ ${formatPath(value.path)}`), children);
  } finally {
    trail.delete(value);
  }
}

function createHistoryNode(historyState, trail) {
  if (trail.has(historyState)) {
    return createNode("[Circular]");
  }

  const stack = Array.isArray(historyState.stack) ? historyState.stack : [];
  const index = Number.isInteger(historyState.index) ? historyState.index : 0;

  trail.add(historyState);

  try {
    return createNode(`history (index ${index}, length ${stack.length})`, [
      createValueNode("index", index, trail),
      createValueNode("length", stack.length, trail),
      createArrayNode("stack", stack, trail, { currentIndex: index }),
    ]);
  } finally {
    trail.delete(historyState);
  }
}

function createValueNode(label, value, trail) {
  if (!isObjectLike(value)) {
    return createNode(withColonLabel(label, formatPrimitive(value)));
  }

  if (Array.isArray(value)) {
    return createArrayNode(label, value, trail);
  }

  if (isVNode(value)) {
    return createVNodeNode(label, value, trail);
  }

  if (isPatch(value)) {
    return createPatchNode(label, value, trail);
  }

  return createObjectNode(label, value, trail);
}

export function formatPatchTree(patches = []) {
  const normalizedPatches = Array.isArray(patches) ? patches : [];

  return renderTree(createArrayNode("patches", normalizedPatches, new Set()));
}

export function formatVNodeTree(vNode) {
  return renderTree(createValueNode(undefined, vNode, new Set()));
}

export function formatHistoryTree(historyState) {
  const normalizedHistoryState = {
    index: historyState?.index ?? 0,
    stack: Array.isArray(historyState?.stack) ? historyState.stack : [],
  };

  return renderTree(createHistoryNode(normalizedHistoryState, new Set()));
}
