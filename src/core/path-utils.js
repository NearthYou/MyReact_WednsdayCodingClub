export function isRootPath(path = []) {
  if (arguments.length > 0 && arguments[0] === undefined) {
    return false;
  }

  return Array.isArray(path) && path.length === 0;
}
