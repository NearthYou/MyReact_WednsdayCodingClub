import assert from "node:assert/strict";
import test from "node:test";

import { diff, diffChildren, diffProps } from "../../../src/core/diff.js";

function text(value) {
  return {
    nodeType: "text",
    text: value
  };
}

function element(tag, props = {}, children = []) {
  return {
    nodeType: "element",
    tag,
    props,
    children
  };
}

test("diff returns CREATE patch when old vnode is missing", () => {
  const newVNode = element("p", { class: "created" }, [text("hello")]);

  assert.deepEqual(diff(null, newVNode), [
    {
      type: "CREATE",
      path: [],
      node: newVNode
    }
  ]);
});

test("diff returns REMOVE patch when new vnode is missing", () => {
  const oldVNode = element("p", { class: "gone" }, [text("bye")]);

  assert.deepEqual(diff(oldVNode, null, [1]), [
    {
      type: "REMOVE",
      path: [1]
    }
  ]);
});

test("diff returns REPLACE patch when node type or tag changes", () => {
  const oldVNode = element("div", {}, []);
  const newVNode = element("section", { id: "next" }, []);

  assert.deepEqual(diff(oldVNode, newVNode, [0]), [
    {
      type: "REPLACE",
      path: [0],
      node: newVNode
    }
  ]);
});

test("diff returns TEXT patch when text node content changes", () => {
  assert.deepEqual(diff(text("before"), text("after"), [2, 0]), [
    {
      type: "TEXT",
      path: [2, 0],
      text: "after"
    }
  ]);
});

test("diff returns PROPS and child patches for nested element changes", () => {
  const oldVNode = element("div", { class: "before" }, [
    element("p", {}, [text("old")])
  ]);
  const newVNode = element("div", { class: "after", title: "greeting" }, [
    element("p", {}, [text("new")]),
    element("span", {}, [text("extra")])
  ]);

  assert.deepEqual(diff(oldVNode, newVNode), [
    {
      type: "PROPS",
      path: [],
      props: {
        set: {
          class: "after",
          title: "greeting"
        },
        remove: []
      }
    },
    {
      type: "TEXT",
      path: [0, 0],
      text: "new"
    },
    {
      type: "CREATE",
      path: [1],
      node: element("span", {}, [text("extra")])
    }
  ]);
});

test("diff returns an empty array when there is no change", () => {
  const vnode = element("article", { id: "same" }, [
    element("strong", {}, [text("content")])
  ]);

  assert.deepEqual(diff(vnode, vnode), []);
});

test("diffChildren compares by max length and propagates nested paths", () => {
  const patches = diffChildren(
    [
      element("li", {}, [text("a")]),
      element("li", {}, [text("b")])
    ],
    [
      element("li", {}, [text("a")]),
      element("li", {}, [text("updated")]),
      element("li", {}, [text("c")])
    ],
    [3]
  );

  assert.deepEqual(patches, [
    {
      type: "TEXT",
      path: [3, 1, 0],
      text: "updated"
    },
    {
      type: "CREATE",
      path: [3, 2],
      node: element("li", {}, [text("c")])
    }
  ]);
});

test("diffProps returns set and remove collections while ignoring event props", () => {
  assert.deepEqual(
    diffProps(
      {
        class: "before",
        hidden: "",
        onclick: "ignored"
      },
      {
        class: "after",
        title: "tooltip",
        hidden: false,
        oninput: "ignored-too"
      }
    ),
    {
      set: {
        class: "after",
        title: "tooltip"
      },
      remove: ["hidden"]
    }
  );
});

test("diffProps returns empty changes when props are effectively identical", () => {
  assert.deepEqual(
    diffProps(
      {
        id: "node",
        onclick: "skip"
      },
      {
        id: "node",
        oninput: "skip"
      }
    ),
    {
      set: {},
      remove: []
    }
  );
});
