export function formatRange(range: string | number | any[], formatFn: any, unit?: string, unitMany?: string): string | undefined {
  // for convenience
  if (typeof (range) == "number") return formatFn(range as number, unit, unitMany);
  if (typeof (range) == "string") return formatFn(range as string, unit, unitMany);

  // when range has only one value or both range vals same, ex: [1] or [1, 1]
  if (Array.isArray(range) && range.length < 2 || range[0] == range[1]) return formatFn(range[0], unit, unitMany);

  const s0 = formatFn(range[0], unit, unitMany);
  const s1 = formatFn(range[1], unit, unitMany);
  const [v0, unit0] = s0.split(" ");
  const [v1, unit1] = s1.split(" ");
  const unitPlurialRegex = /(\w+)s/;
  const units = [unit0, unit1].map((unit: string) => {
    const match = unit.match(unitPlurialRegex)
    return match && match.length > 0 && match[1] || unit;
  });

  if (units[0] == units[1]) {
    return `${v0}-${v1} ${unit1}`;
  }

  return `${s0}-${s1}`;
}

export function formatTime(v: number | string): string {
  if (typeof (v) == "string") return v;

  if (v >= 1000 * 60 * 60 * 2) return `${v / 1000 / 60 / 60} hours"`;
  if (v == 1000 * 60 * 60) return `${v / 1000 / 60 / 60} hour`;
  if (v >= 1000 * 60 * 2) return `${v / 1000 / 60} minutes`;
  if (v == 1000 * 60) return `${v / 1000 / 60} minute`;
  if (v >= 1000 * 2) return `${v / 1000} seconds`;
  if (v == 1000) return `${v / 1000} second`;

  return `${v / 1000} seconds`
}

export function formatNumber(v: number | string, unit?: string, unitMany?: string): string {
  const n = Number(v);
  const unitStr = unit
    ? n > 1
      ? (unitMany || ` ${unit}s`)
      : ` ${unit}`
    : "";

  return `${n}${unitStr}`;
}

export function capitalize(s: string) {
  return s && s
    .split(/\s+/)
    .map((s: string) => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`)
    .join(" ");
}