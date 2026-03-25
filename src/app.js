function setInitialDebugText() {
  const patchLog = document.querySelector("#patch-log");
  const vdomLog = document.querySelector("#vdom-log");
  const historyLog = document.querySelector("#history-log");

  if (patchLog) {
    patchLog.textContent = "Scaffold ready. Patch log will appear here.";
  }

  if (vdomLog) {
    vdomLog.textContent = "Scaffold ready. Current VDOM will appear here.";
  }

  if (historyLog) {
    historyLog.textContent = "Scaffold ready. History state will appear here.";
  }
}

function setInitialButtonState() {
  const undoButton = document.querySelector("#undo-btn");
  const redoButton = document.querySelector("#redo-btn");

  if (undoButton) {
    undoButton.disabled = true;
  }

  if (redoButton) {
    redoButton.disabled = true;
  }
}

export function initApp() {
  const root = document.querySelector("#app");

  if (!root) {
    return;
  }

  setInitialDebugText();
  setInitialButtonState();
}

initApp();
