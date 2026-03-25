import { diff } from "./core/diff.js";
import { applyPatches } from "./core/patch.js";
import { renderVNode } from "./core/render.js";
import {
  cloneVNode,
  domChildrenToVNodes,
  mergeRetainedEventProps
} from "./core/vdom.js";
import {
  createHistory,
  getCurrentHistoryVNode,
  pushHistory,
  redoHistory,
  undoHistory,
} from "./state/history.js";
import { bindControls, setButtonState } from "./ui/bindings.js";
import { updateAllDebugPanels } from "./ui/debug-panel.js";
import { formatHistoryTree, formatVNodeTree } from "./ui/tree-formatter.js";

const TEXT_NODE = 3;
const COMMENT_NODE = 8;

function handleSampleButtonClick() {
  console.log("[Mini Virtual DOM Playground] Sample button clicked.");
}

function createInitialSampleVNode() {
  return {
    nodeType: "element",
    tag: "div",
    props: {
      class: "card"
    },
    children: [
      {
        nodeType: "element",
        tag: "h1",
        props: {},
        children: [
          {
            nodeType: "text",
            text: "Mini Virtual DOM"
          }
        ]
      },
      {
        nodeType: "element",
        tag: "p",
        props: {
          "data-role": "description"
        },
        children: [
          {
            nodeType: "text",
            text: "Edit the test area and patch the real area."
          }
        ]
      },
      {
        nodeType: "element",
        tag: "ul",
        props: {},
        children: [
          {
            nodeType: "element",
            tag: "li",
            props: {},
            children: [
              {
                nodeType: "text",
                text: "Diff text"
              }
            ]
          },
          {
            nodeType: "element",
            tag: "li",
            props: {},
            children: [
              {
                nodeType: "text",
                text: "Diff props"
              }
            ]
          },
          {
            nodeType: "element",
            tag: "li",
            props: {},
            children: [
              {
                nodeType: "text",
                text: "Add and remove nodes"
              }
            ]
          }
        ]
      },
      {
        nodeType: "element",
        tag: "button",
        props: {
          title: "sample button",
          onClick: handleSampleButtonClick
        },
        children: [
          {
            nodeType: "text",
            text: "Patch me"
          }
        ]
      }
    ]
  };
}

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

function readSingleRootVNode(container) {
  const children = domChildrenToVNodes(container);

  return children.length === 1 ? children[0] : null;
}

function isIgnorableNode(node) {
  if (!node) {
    return true;
  }

  if (node.nodeType === COMMENT_NODE) {
    return true;
  }

  if (node.nodeType === TEXT_NODE) {
    return String(node.nodeValue ?? "").trim() === "";
  }

  return false;
}

function getPatchTargetNode(container) {
  const renderableChildren = Array.from(container?.childNodes ?? []).filter(
    (childNode) => !isIgnorableNode(childNode),
  );

  return renderableChildren.length === 1 ? renderableChildren[0] : null;
}

function isSameVNode(leftVNode, rightVNode) {
  if (!leftVNode || !rightVNode) {
    return leftVNode === rightVNode;
  }

  return diff(leftVNode, rightVNode).length === 0;
}

function patchContainer(container, fromVNode, toVNode, patches) {
  const currentDomVNode = mergeRetainedEventProps(fromVNode, readSingleRootVNode(container));

  if (patches.length === 0) {
    if (!isSameVNode(currentDomVNode, toVNode)) {
      renderVNode(toVNode, container);
    }

    return;
  }

  const patchTarget = getPatchTargetNode(container);

  if (!patchTarget || !isSameVNode(currentDomVNode, fromVNode)) {
    renderVNode(toVNode, container);
    return;
  }

  applyPatches(patchTarget, patches);

  const patchedDomVNode = mergeRetainedEventProps(toVNode, readSingleRootVNode(container));

  if (!isSameVNode(patchedDomVNode, toVNode)) {
    renderVNode(toVNode, container);
  }
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
    vdomLog.textContent = formatVNodeTree(null);
  }

  if (historyLog) {
    historyLog.textContent = formatHistoryTree({
      index: 0,
      stack: [],
    });
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

function transitionRootsWithPatches(realRoot, testRoot, fromVNode, toVNode) {
  const patches = diff(fromVNode, toVNode);

  patchContainer(realRoot, fromVNode, toVNode, patches);
  patchContainer(testRoot, fromVNode, toVNode, patches);

  return {
    currentVNode: cloneVNode(toVNode),
    patches,
  };
}

export function initApp() {
  const elements = getAppElements();

  if (!elements) {
    return;
  }

  const { realRoot, testRoot } = elements;

  try {
    const initialVNode = createInitialSampleVNode();

    if (!initialVNode) {
      setBootstrapError("앱 초기화 실패: 샘플에서 단일 루트 VDOM을 만들 수 없습니다.");
      return;
    }

    const initialSnapshot = cloneVNode(initialVNode);
    let currentVNode = cloneVNode(initialSnapshot);
    let historyState = createHistory(initialSnapshot);

    syncRenderRoots(realRoot, testRoot, currentVNode, historyState);

    bindControls({
      onPatch: () => {
        const newVNode = mergeRetainedEventProps(currentVNode, readSingleRootVNode(testRoot));

        if (!newVNode) {
          syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
          return;
        }

        const patches = diff(currentVNode, newVNode);

        if (patches.length === 0) {
          renderVNode(currentVNode, testRoot);
          refreshUi({ patches, vNode: currentVNode, historyState });
          return;
        }

        patchContainer(realRoot, currentVNode, newVNode, patches);

        currentVNode = cloneVNode(newVNode);
        historyState = pushHistory(historyState, currentVNode);

        renderVNode(currentVNode, testRoot);
        refreshUi({ patches, vNode: currentVNode, historyState });
      },
      onUndo: () => {
        historyState = undoHistory(historyState);
        const targetVNode = getCurrentHistoryVNode(historyState);

        if (!targetVNode) {
          syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
          return;
        }

        const transition = transitionRootsWithPatches(
          realRoot,
          testRoot,
          currentVNode,
          targetVNode,
        );

        currentVNode = transition.currentVNode;
        refreshUi({ patches: transition.patches, vNode: currentVNode, historyState });
      },
      onRedo: () => {
        historyState = redoHistory(historyState);
        const targetVNode = getCurrentHistoryVNode(historyState);

        if (!targetVNode) {
          syncRenderRoots(realRoot, testRoot, currentVNode, historyState);
          return;
        }

        const transition = transitionRootsWithPatches(
          realRoot,
          testRoot,
          currentVNode,
          targetVNode,
        );

        currentVNode = transition.currentVNode;
        refreshUi({ patches: transition.patches, vNode: currentVNode, historyState });
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
