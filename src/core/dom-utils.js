export function assertDomNode(value, label = "domNode") {
  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export function isEventAttribute(name) {
  return /^on/i.test(name);
}
