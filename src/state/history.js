import { cloneVNode } from "../core/vdom.js";

function cloneSnapshot(vNode) {
  return cloneVNode(vNode);
}

export function createHistory(initialVNode) {
  return {
    stack: [cloneSnapshot(initialVNode)],
    index: 0,
  };
}

export function pushHistory(historyState, vNode) {
  const nextStack = historyState.stack.slice(0, historyState.index + 1);

  nextStack.push(cloneSnapshot(vNode));

  return {
    stack: nextStack,
    index: nextStack.length - 1,
  };
}

export function undoHistory(historyState) {
  const nextIndex = historyState.index > 0 ? historyState.index - 1 : historyState.index;

  return {
    stack: historyState.stack,
    index: nextIndex,
  };
}

export function redoHistory(historyState) {
  const lastIndex = historyState.stack.length - 1;
  const nextIndex = historyState.index < lastIndex ? historyState.index + 1 : historyState.index;

  return {
    stack: historyState.stack,
    index: nextIndex,
  };
}

export function getCurrentHistoryVNode(historyState) {
  const currentVNode = historyState.stack[historyState.index];

  return currentVNode ? cloneSnapshot(currentVNode) : null;
}
