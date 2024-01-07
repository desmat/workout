import { v4 as uuidv4 } from 'uuid';

export function uuid(): string {
  return uuidv4().substring(0, 8);
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

export function arrayToObject(array: any[]) {
  return array.reduce((o, [k, v]) => Object.assign(o, { [k]: v }), {});
}

export function searchParamsToObject(searchParams: string) {
  return arrayToObject(searchParams
    .split(",")
    .filter(Boolean)
    .map((entry: string) => entry.split("=")))
}

export function round(n: number, digits?: any) {
  const exp = 10 ** digits || 10;
  return Math.round(n * exp) / exp;
}
