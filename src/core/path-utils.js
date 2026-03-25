export function isRootPath(path = []) {
  return Array.isArray(path) && path.length === 0;
}
