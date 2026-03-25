function isEventProp(name) {
  return /^on/i.test(name);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isRemovablePropValue(value) {
  return value === null || value === undefined || value === false;
}

function hasPropChanges(propPatch) {
  return Object.keys(propPatch.set).length > 0 || propPatch.remove.length > 0;
}

export function diff(oldVNode, newVNode, path = []) {
  if (!oldVNode && !newVNode) {
    return [];
  }

  if (!oldVNode) {
    return [
      {
        type: "CREATE",
        path,
        node: newVNode
      }
    ];
  }

  if (!newVNode) {
    return [
      {
        type: "REMOVE",
        path
      }
    ];
  }

  if (oldVNode.nodeType !== newVNode.nodeType) {
    return [
      {
        type: "REPLACE",
        path,
        node: newVNode
      }
    ];
  }

  if (oldVNode.nodeType === "text" && newVNode.nodeType === "text") {
    if (String(oldVNode.text ?? "") === String(newVNode.text ?? "")) {
      return [];
    }

    return [
      {
        type: "TEXT",
        path,
        text: String(newVNode.text ?? "")
      }
    ];
  }

  if (oldVNode.tag !== newVNode.tag) {
    return [
      {
        type: "REPLACE",
        path,
        node: newVNode
      }
    ];
  }

  const patches = [];
  const propPatch = diffProps(oldVNode.props ?? {}, newVNode.props ?? {});

  if (hasPropChanges(propPatch)) {
    patches.push({
      type: "PROPS",
      path,
      props: propPatch
    });
  }

  return patches.concat(
    diffChildren(oldVNode.children ?? [], newVNode.children ?? [], path)
  );
}

export function diffProps(oldProps = {}, newProps = {}) {
  const set = {};
  const remove = [];

  for (const [name, nextValue] of Object.entries(newProps)) {
    if (!name || isEventProp(name)) {
      continue;
    }

    if (isRemovablePropValue(nextValue)) {
      if (hasOwn(oldProps, name)) {
        remove.push(name);
      }

      continue;
    }

    if (!hasOwn(oldProps, name) || oldProps[name] !== nextValue) {
      set[name] = nextValue;
    }
  }

  for (const [name, previousValue] of Object.entries(oldProps)) {
    if (!name || isEventProp(name)) {
      continue;
    }

    if (!hasOwn(newProps, name) && !remove.includes(name)) {
      remove.push(name);
    }
  }

  return { set, remove };
}

export function diffChildren(oldChildren = [], newChildren = [], path = []) {
  const previousChildren = Array.isArray(oldChildren) ? oldChildren : [];
  const nextChildren = Array.isArray(newChildren) ? newChildren : [];
  const patches = [];
  const maxLength = Math.max(previousChildren.length, nextChildren.length);

  for (let index = 0; index < maxLength; index += 1) {
    patches.push(
      ...diff(previousChildren[index], nextChildren[index], [...path, index])
    );
  }

  return patches;
}
