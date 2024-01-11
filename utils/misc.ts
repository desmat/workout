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

function kvArrayToObject(array: any[]) {
  return array.reduce((o, [k, v]) => Object.assign(o, { [k]: v }), {});
}

export function searchParamsToMap(searchParams: string): object {
  return kvArrayToObject(
    searchParams
      .split("&")
      .filter(Boolean)
      .map((e) => e.split(","))
      .flat()
      .map((e) => e.split("=")));
}

export function mapToSearchParams(m: object): string {
  return Object.entries(m)
    .map((e) => e.join("="))
    .join("&");
}

export function listToMap(
  l: any[],
  opts?: {
    keyFn?: (e: any) => string,
    valFn?: (e: any) => any,
  }) {
  const keyFn = opts?.keyFn || function (e: any) { return e.id };
  const valFn = opts?.valFn || function (e: any) { return e };

  return kvArrayToObject(l.map((e: any) => [keyFn(e), valFn(e)]));
}

export function mapToList(
  m: any = {},
  entryFn: (e: [any, any]) => any = ([k, v]: any) => v): any[] {
  return Object.entries(m).map((e: any) => entryFn(e));
}

// export function mapToKeyVals(m: object): [k: string, v: any] {
//   return Object.entries(m || {}) || [];
// }

export function round(n: number, digits?: any) {
  const exp = 10 ** digits || 10;
  return Math.round(n * exp) / exp;
}
