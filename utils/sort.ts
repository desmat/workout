
export const byName = (a: any, b: any) => {
  if (a && a.name && b && b.name && a.name.toLowerCase() > b.name.toLowerCase()) return 1;
  return -1;
}

export const byCreatedAt = (a: any, b: any) => {
  return (a.createdAt || 0) - (b.createdAt || 0)
}

export const byCreatedAtDesc = (a: any, b: any) => {
  return (b.createdAt || 0) - (a.createdAt || 0)
}
