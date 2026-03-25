import assert from "node:assert/strict";
import test from "node:test";

import { diffProps } from "../../../src/core/diff.js";
import { createDomFromVNode, setDomProps } from "../../../src/core/render.js";
import { domToVNode } from "../../../src/core/vdom.js";
import { installFakeDomGlobals, serializeNode } from "./fake-dom.js";

test("diffProps ignores known event handler attributes without dropping non-event on* props", () => {
  assert.deepEqual(
    diffProps(
      {
        onclick: "old-handler",
        once: "before",
        "onboarding-id": "a1",
      },
      {
        onclick: "new-handler",
        once: "after",
        "onboarding-id": "b2",
      },
    ),
    {
      set: {
        once: "after",
        "onboarding-id": "b2",
      },
      remove: [],
    },
  );
});

test("domToVNode preserves non-event on* attributes while still ignoring known event handlers", (t) => {
  const { document, restore } = installFakeDomGlobals();

  t.after(restore);

  const element = document.createElement("div");

  element.setAttribute("onclick", "ignored");
  element.setAttribute("once", "token");
  element.setAttribute("onboarding-id", "hero");
  element.appendChild(document.createTextNode("Hello"));

  assert.deepEqual(domToVNode(element), {
    nodeType: "element",
    tag: "div",
    props: {
      once: "token",
      "onboarding-id": "hero",
    },
    children: [
      {
        nodeType: "text",
        text: "Hello",
      },
    ],
  });
});

test("render helpers set non-event on* attributes while still skipping known handlers", (t) => {
  const { document, restore } = installFakeDomGlobals();

  t.after(restore);

  const rendered = createDomFromVNode({
    nodeType: "element",
    tag: "button",
    props: {
      onclick: "ignored",
      once: "allowed",
      "onboarding-id": "cta",
    },
    children: [],
  });

  assert.deepEqual(serializeNode(rendered), {
    nodeType: "element",
    tag: "button",
    props: {
      once: "allowed",
      "onboarding-id": "cta",
    },
    children: [],
  });

  const element = document.createElement("div");

  setDomProps(element, {
    onclick: "ignored",
    once: "updated",
    "onboarding-id": "banner",
  });

  assert.deepEqual(serializeNode(element), {
    nodeType: "element",
    tag: "div",
    props: {
      once: "updated",
      "onboarding-id": "banner",
    },
    children: [],
  });
});
