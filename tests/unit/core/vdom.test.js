import assert from "node:assert/strict";
import test from "node:test";

import { mergeRetainedEventProps } from "../../../src/core/vdom.js";

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

test("mergeRetainedEventProps keeps function events on the same path and tag", () => {
  const handleClick = () => {};
  const sourceVNode = element("div", {}, [
    element("button", { onClick: handleClick }, [text("before")])
  ]);
  const targetVNode = element("div", {}, [
    element("button", { title: "updated" }, [text("after")])
  ]);

  const mergedVNode = mergeRetainedEventProps(sourceVNode, targetVNode);

  assert.equal(mergedVNode.children[0].props.onClick, handleClick);
  assert.equal(mergedVNode.children[0].props.title, "updated");
  assert.equal(mergedVNode.children[0].children[0].text, "after");
});

test("mergeRetainedEventProps does not keep handlers for replaced tags or new nodes", () => {
  const handleClick = () => {};
  const sourceVNode = element("div", {}, [
    element("button", { onClick: handleClick }, [text("keep me")])
  ]);
  const targetVNode = element("div", {}, [
    element("a", { href: "#" }, [text("link")]),
    element("button", { title: "new button" }, [text("new")])
  ]);

  const mergedVNode = mergeRetainedEventProps(sourceVNode, targetVNode);

  assert.equal("onClick" in mergedVNode.children[0].props, false);
  assert.equal("onClick" in mergedVNode.children[1].props, false);
});
