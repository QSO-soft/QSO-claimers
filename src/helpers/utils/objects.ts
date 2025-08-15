export function removePropertyRecursively(value: unknown, property: string): void {
  if (Array.isArray(value)) {
    for (const item of value) removePropertyRecursively(item, property);
  } else if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key === property) delete obj[key];
      else removePropertyRecursively(obj[key], property);
    }
  }
}
