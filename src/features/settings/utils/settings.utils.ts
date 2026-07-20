export function mergeUniqueById<T extends { _id: string }>(
  prev: T[],
  next: T[],
): T[] {
  const map = new Map(prev.map((item) => [item._id, item]));
  next.forEach((item) => map.set(item._id, item));
  return Array.from(map.values());
}

export function formatSessionTime(value?: string) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
