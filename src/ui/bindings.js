function getButton(id) {
  return document.querySelector(id);
}

export function bindControls(handlers) {
  const patchButton = getButton("#patch-btn");
  const undoButton = getButton("#undo-btn");
  const redoButton = getButton("#redo-btn");
  const resetButton = getButton("#reset-btn");

  if (patchButton) {
    patchButton.onclick = handlers.onPatch;
  }

  if (undoButton) {
    undoButton.onclick = handlers.onUndo;
  }

  if (redoButton) {
    redoButton.onclick = handlers.onRedo;
  }

  if (resetButton) {
    resetButton.onclick = handlers.onReset;
  }
}

export function setButtonState({ canUndo, canRedo }) {
  const undoButton = getButton("#undo-btn");
  const redoButton = getButton("#redo-btn");

  if (undoButton) {
    undoButton.disabled = !canUndo;
  }

  if (redoButton) {
    redoButton.disabled = !canRedo;
  }
}
