import assert from "node:assert/strict";
import test from "node:test";

import {
  formatHistoryTree,
  formatPatchTree,
  formatVNodeTree,
} from "../../../src/ui/tree-formatter.js";

function text(value) {
  return {
    nodeType: "text",
    text: value,
  };
}

function element(tag, props = {}, children = []) {
  return {
    nodeType: "element",
    tag,
    props,
    children,
  };
}

test("formatPatchTree renders patches as a tree instead of raw json", () => {
  assert.equal(
    formatPatchTree([
      {
        type: "TEXT",
        path: [0, 1],
        text: "updated",
      },
      {
        type: "REMOVE",
        path: [2],
      },
    ]),
    [
      "patches [2]",
      "├─ [0]: TEXT @ root > 0 > 1",
      "│  └─ text: \"updated\"",
      "└─ [1]: REMOVE @ root > 2",
    ].join("\n"),
  );
});

test("formatVNodeTree renders nested element structure with props and children", () => {
  assert.equal(
    formatVNodeTree(
      element("section", { id: "intro" }, [
        element("h1", {}, [text("Hello")]),
      ]),
    ),
    [
      "element <section>",
      "├─ props {1}",
      "│  └─ id: \"intro\"",
      "└─ children [1]",
      "   └─ [0]: element <h1>",
      "      ├─ props {}",
      "      └─ children [1]",
      "         └─ [0]: text \"Hello\"",
    ].join("\n"),
  );
});

test("formatHistoryTree marks the current snapshot in the history stack", () => {
  assert.equal(
    formatHistoryTree({
      index: 1,
      stack: [
        element("div"),
        element("p", {}, [text("now")]),
      ],
    }),
    [
      "history (index 1, length 2)",
      "├─ index: 1",
      "├─ length: 2",
      "└─ stack [2]",
      "   ├─ [0]: element <div>",
      "   │  ├─ props {}",
      "   │  └─ children []",
      "   └─ [1] current: element <p>",
      "      ├─ props {}",
      "      └─ children [1]",
      "         └─ [0]: text \"now\"",
    ].join("\n"),
  );
});
