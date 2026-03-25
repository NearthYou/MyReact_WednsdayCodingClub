export function assertDomNode(value, label = "domNode") {
  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export function isEventAttribute(name) {
  return /^on/i.test(String(name ?? ""));
}

export function normalizeEventPropName(name) {
  if (!isEventAttribute(name)) {
    return "";
  }

  const eventName = String(name ?? "")
    .slice(2)
    .trim()
    .toLowerCase();

  return eventName ? `on${eventName}` : "";
}

export function isFunctionEventProp(name, value) {
  return Boolean(normalizeEventPropName(name)) && typeof value === "function";
}
