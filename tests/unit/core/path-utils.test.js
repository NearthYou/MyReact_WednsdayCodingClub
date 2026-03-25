import assert from "node:assert/strict";
import test from "node:test";

import { isRootPath } from "../../../src/core/path-utils.js";

test("isRootPath returns true for the empty root path", () => {
  assert.equal(isRootPath([]), true);
});

test("isRootPath returns false for non-empty paths", () => {
  assert.equal(isRootPath([0]), false);
  assert.equal(isRootPath([1, 2]), false);
});

test("isRootPath returns false for non-array values", () => {
  assert.equal(isRootPath(null), false);
  assert.equal(isRootPath(undefined), false);
  assert.equal(isRootPath(""), false);
});
