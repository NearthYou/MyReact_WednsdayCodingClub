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

  loadSampleHtml(realRoot);

  const initialVNode = readSingleRootVNode(realRoot);

  if (!initialVNode) {
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
}

initApp();
