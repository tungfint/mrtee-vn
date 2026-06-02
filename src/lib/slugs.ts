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

export function studentSlugFromName(fullName: string) {
  return slugifyVietnamese(fullName);
}

export function looksLikeEmailDerivedSlug(value: string) {
  const slug = slugifyVietnamese(value);

  return /(gmailcom|googlemailcom|yahoocom|outlookcom|hotmailcom|icloudcom|studentmrteelocal)$/.test(slug);
}

export function studentImportSlug(fullName: string, requestedSlug?: string | null) {
  const fromName = studentSlugFromName(fullName);
  const fromRequest = requestedSlug ? slugifyVietnamese(requestedSlug) : "";

  if (!fromRequest || looksLikeEmailDerivedSlug(fromRequest)) {
    return fromName;
  }

  return fromRequest;
}

export function studentEmailFromSlug(context: string, studentSlug: string) {
  return `${context.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${studentSlug}@student.mrtee.local`;
}
