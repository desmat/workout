export function formatTime(v: number | string) {
  if (typeof (v) == "string") return [v];

  if (v >= 1000 * 60 * 60 * 2) return [v / 1000 / 60 / 60, "hours"];
  if (v == 1000 * 60 * 60) return [v / 1000 / 60 / 60, "hour"];
  if (v >= 1000 * 60 * 2) return [v / 1000 / 60, "minutes"];
  if (v == 1000 * 60) return [v / 1000 / 60, "minute"];
  if (v >= 1000 * 2) return [v / 1000, "seconds"];
  if (v == 1000) return [v / 1000, "second"];

  return [v / 1000, "seconds"];
}

export function formatNumber(v: number | string) {
  if (typeof (v) == "string") return [v];
  if (typeof (v) == "number") return [`${v}`];

  return [];
}

export function formatRange(range: string | number | any[], formatFn: any, prefix?: string, postfix?: string): string | undefined {
  if (Array.isArray(range)) {
    if (range.length > 1) {
      if ([typeof (range[0]), typeof(range[1])].includes("number")) {
        // maybe we'll format a range with same or different units, ex: 30-50 seconds vs 30 seconds - 2 minutes
        const [v0, unit0] = formatFn(range[0]);
        const [v1, unit1] = formatFn(range[1]);
        
        if (v0 == v1 && unit0 == unit1) return formatRange(range[0], formatFn, prefix, unit0 || postfix);

        const postfix0 = unit0 && unit0 != unit1 ? ` ${unit0}` : "";
        const postfix1 = unit1 ? ` ${unit1}` : postfix;
        return `${formatRange(`${v0}`, formatFn, prefix, postfix0)}${formatRange(`${v1}`, formatFn, "-", postfix1)}`;
      }

      return `${formatRange(range[0], formatFn, prefix, postfix)}${formatRange(range[1], formatFn, "-", postfix)}`;
    }

    if (range.length > 0 && range[0]) {
      return formatRange(range[0], formatFn, prefix, postfix);
    }
  }

  if (((typeof (range) == "string") || (typeof (range) == "number")) && range) {
    let [v, unit] = formatFn(range);
    return `${prefix != undefined ? prefix : ""}${v}${postfix != undefined ? postfix : unit ? ` ${unit}` : ""}`;
  }

  return undefined;
}
