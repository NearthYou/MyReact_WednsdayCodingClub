import {
  formatHistoryTree,
  formatPatchTree,
  formatVNodeTree,
} from "./tree-formatter.js";

function setPanelText(selector, text) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = text;
}

export function updatePatchLog(patches = []) {
  setPanelText("#patch-log", formatPatchTree(patches));
}

export function updateVNodeLog(vNode) {
  setPanelText("#vdom-log", formatVNodeTree(vNode));
}

export function updateHistoryLog(historyState) {
  setPanelText("#history-log", formatHistoryTree(historyState));
}

export function updateAllDebugPanels({ patches, vNode, historyState }) {
  updatePatchLog(patches);
  updateVNodeLog(vNode);
  updateHistoryLog(historyState);
}
