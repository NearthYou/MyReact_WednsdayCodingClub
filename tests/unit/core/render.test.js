import assert from "node:assert/strict";
import test from "node:test";

import { removeDomProp, setDomProps } from "../../../src/core/render.js";

function createMockElement() {
  return {
    attributes: new Map(),
    onclick: null,
    oninput: null,
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    }
  };
}

test("setDomProps applies normal attrs and function event props", () => {
  const handleClick = () => {};
  const element = createMockElement();

  setDomProps(element, {
    class: "card",
    hidden: true,
    onClick: handleClick,
    onInput: "ignored"
  });

  assert.equal(element.attributes.get("class"), "card");
  assert.equal(element.attributes.get("hidden"), "");
  assert.equal(element.onclick, handleClick);
  assert.equal(element.oninput, null);
});

test("removeDomProp removes attrs and clears event properties", () => {
  const handleClick = () => {};
  const element = createMockElement();

  element.setAttribute("title", "demo");
  element.onclick = handleClick;

  removeDomProp(element, "title");
  removeDomProp(element, "onClick");

  assert.equal(element.attributes.has("title"), false);
  assert.equal(element.onclick, null);
});
