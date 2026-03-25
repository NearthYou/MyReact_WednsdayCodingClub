function setPanelText(selector, value) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = JSON.stringify(value, null, 2);
}

export function updatePatchLog(patches = []) {
  setPanelText("#patch-log", patches);
}

export function updateVNodeLog(vNode) {
  setPanelText("#vdom-log", vNode);
}

export function updateHistoryLog(historyState) {
  setPanelText("#history-log", {
    index: historyState?.index ?? 0,
    length: historyState?.stack?.length ?? 0,
    stack: historyState?.stack ?? [],
  });
}

export function updateAllDebugPanels({ patches, vNode, historyState }) {
  updatePatchLog(patches);
  updateVNodeLog(vNode);
  updateHistoryLog(historyState);
}
