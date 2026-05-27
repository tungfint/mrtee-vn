export function slugifyVietnamese(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^_+|_+$/g, "");
}

export function studentEmailFromSlug(context: string, studentSlug: string) {
  return `${context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${studentSlug}@student.mrtee.local`;
}
