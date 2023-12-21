
export function uuid(): string {
  return crypto.randomUUID().substring(0, 8);
}

// from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function hashCode(str: string): number {
  let hash = 0,
    i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
