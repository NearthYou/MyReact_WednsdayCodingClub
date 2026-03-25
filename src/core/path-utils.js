export function isRootPath(...args) {
  if (args.length === 0) {
    return true;
  }

  if (args.length > 1) {
    return false;
  }

  const [path] = args;
  return Array.isArray(path) && path.length === 0;
}
