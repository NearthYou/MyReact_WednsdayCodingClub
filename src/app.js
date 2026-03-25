import { SAMPLE_HTML } from "../assets/sample-html.js";
import { diff } from "./core/diff.js";
import { applyPatches } from "./core/patch.js";
import { renderVNode } from "./core/render.js";
import { cloneVNode, domChildrenToVNodes } from "./core/vdom.js";
import {
  createHistory,
  getCurrentHistoryVNode,
  pushHistory,
  redoHistory,
  undoHistory,
} from "./state/history.js";
import { bindControls, setButtonState } from "./ui/bindings.js";
import { updateAllDebugPanels } from "./ui/debug-panel.js";

function getAppElements() {
  const realRoot = document.querySelector("#real-root");
  const testRoot = document.querySelector("#test-root");

  if (!realRoot || !testRoot) {
    return null;
  }

  return {
    realRoot,
    testRoot,
  };
}

function loadSampleHtml(container) {
  const template = document.createElement("template");

  template.innerHTML = SAMPLE_HTML.trim();
  container.replaceChildren(template.content.cloneNode(true));
}

function readSingleRootVNode(container) {
  const children = domChildrenToVNodes(container);

  return children.length === 1 ? children[0] : null;
}

function getButtonFlags(historyState) {
  return {
    canUndo: historyState.index > 0,
    canRedo: historyState.index < historyState.stack.length - 1,
  };
}

function refreshUi({ patches = [], vNode, historyState }) {
  updateAllDebugPanels({ patches, vNode, historyState });
  setButtonState(getButtonFlags(historyState));
}

function setBootstrapError(message) {
  const patchLog = document.querySelector("#patch-log");
  const vdomLog = document.querySelector("#vdom-log");
  const historyLog = document.querySelector("#history-log");
  const patchButton = document.querySelector("#patch-btn");
  const undoButton = document.querySelector("#undo-btn");
  const redoButton = document.querySelector("#redo-btn");
  const resetButton = document.querySelector("#reset-btn");

  if (patchLog) {
    patchLog.textContent = message;
  }

  if (vdomLog) {
    vdomLog.textContent = "null";
  }

  if (historyLog) {
    historyLog.textContent = JSON.stringify(
      {
        index: 0,
        length: 0,
        stack: [],
      },
      null,
      2,
    );
  }

  if (patchButton) {
    patchButton.disabled = true;
  }

  if (undoButton) {
    undoButton.disabled = true;
  }

  if (redoButton) {
    redoButton.disabled = true;
  }

  if (resetButton) {
    resetButton.disabled = true;
  }
}

function syncRenderRoots(realRoot, testRoot, currentVNode, historyState, patches = []) {
  renderVNode(currentVNode, realRoot);
  renderVNode(currentVNode, testRoot);
  refreshUi({ patches, vNode: currentVNode, historyState });
}

export function initApp() {
  const elements = getAppElements();

  if (!elements) {
    return;
  }

  const { realRoot, testRoot } = elements;

  try {
    loadSampleHtml(realRoot);

    const initialVNode = readSingleRootVNode(realRoot);

    if (!initialVNode) {
      setBootstrapError("앱 초기화 실패: 샘플에서 단일 루트 VDOM을 만들 수 없습니다.");
      return;
    }

    const initialSnapshot = cloneVNode(initialVNode);
    let currentVNode = cloneVNode(initialSnapshot);
    let historyState = createHistory(initialSnapshot);

    renderVNode(currentVNode, testRoot);
    refreshUi({ patches: [], vNode: currentVNode, historyState });

    bindControls({
      onPatch: () => {
        const newVNode = readSingleRootVNode(testRoot);

        if (!newVNode || !realRoot.firstChild) {
          syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
          return;
        }

        const patches = diff(currentVNode, newVNode);

        if (patches.length === 0) {
          renderVNode(currentVNode, testRoot);
          refreshUi({ patches, vNode: currentVNode, historyState });
          return;
        }

        applyPatches(realRoot.firstChild, patches);

        currentVNode = cloneVNode(newVNode);
        historyState = pushHistory(historyState, currentVNode);

        renderVNode(currentVNode, testRoot);
        refreshUi({ patches, vNode: currentVNode, historyState });
      },
      onUndo: () => {
        historyState = undoHistory(historyState);
        currentVNode = getCurrentHistoryVNode(historyState);

        syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
      },
      onRedo: () => {
        historyState = redoHistory(historyState);
        currentVNode = getCurrentHistoryVNode(historyState);

        syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
      },
      onReset: () => {
        currentVNode = cloneVNode(initialSnapshot);
        historyState = createHistory(initialSnapshot);

        syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? `앱 초기화 실패: ${error.message}`
        : "앱 초기화 실패: core 모듈이 아직 준비되지 않았습니다.";

    setBootstrapError(message);
  }
}

initApp();
