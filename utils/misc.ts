import groupby from 'object.groupby';

export function groupBy(arr: any[], fn: (e: any) => any): any {
  return groupby(arr, fn);
}