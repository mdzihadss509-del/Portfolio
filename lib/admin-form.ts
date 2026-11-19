export type AdminScalar = string | number | boolean | null | undefined;
export type AdminRecord = Record<string, unknown>;

const DATE_ONLY_FIELDS = new Set(["start_date", "end_date"]);
const TIMESTAMP_FIELDS = new Set(["published_at"]);
const NUMBER_FIELDS = new Set(["sort_order", "size_bytes"]);
const EMAIL_FIELDS = new Set(["email"]);
const URL_FIELDS = new Set([
  "href",
  "url",
  "youtube_url",
  "live_url",
  "source_url",
  "cover_url",
  "avatar_url",
  "logo_url",
  "favicon_url",
  "hero_image_url",
  "og_image_url",
  "thumbnail_url",
  "public_url",
  "icon_url",
]);

const REQUIRED_FIELDS: Record<string, readonly string[]> = {
  sections: ["slug", "title"],
  projects: ["slug", "title"],
  skills: ["name"],
  experiences: ["role"],
  education: ["institution"],
  services: ["title"],
  articles: ["slug", "title", "status"],
  videos: ["title", "youtube_url"],
  social_links: ["platform", "url"],
  testimonials: ["person", "quote"],
  navigation_items: ["label", "href"],
  contact_messages: ["name", "email", "message", "status"],
  media_assets: ["storage_path", "filename"],
  site_settings: ["key", "value"],
  categories: ["name", "slug", "kind"],
};

export function getAdminInputType(key: string): string {
  if (DATE_ONLY_FIELDS.has(key)) return "date";
  if (TIMESTAMP_FIELDS.has(key)) return "datetime-local";
  if (NUMBER_FIELDS.has(key)) return "number";
  if (EMAIL_FIELDS.has(key)) return "email";
  if (URL_FIELDS.has(key)) return "url";
  return "text";
}

export function isAdminRequired(table: string, key: string): boolean {
  return REQUIRED_FIELDS[table]?.includes(key) ?? false;
}

export function getAdminSelectOptions(table: string, key: string): ReadonlyArray<{ value: string; label: string }> | null {
  if (key === "status" && table === "articles") {
    return [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }];
  }
  if (key === "status" && table === "contact_messages") {
    return [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }, { value: "archived", label: "Archived" }];
  }
  return null;
}

function isValidDateOnly(value: string): boolean {
  if (value.length !== 10 || value[4] !== "-" || value[7] !== "-") return false;
  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].every(Number.isInteger)) return false;
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function toLocalDateTimeInput(value: string): string {
  if (!value || value.toLowerCase() === "dd") return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

export function formatAdminInputValue(
  key: string,
  value: unknown,
  isArray = false,
): string {
  if (value === null || value === undefined) return "";
  if (DATE_ONLY_FIELDS.has(key)) {
    const raw = String(value);
    if (raw.toLowerCase() === "dd") return "";
    const candidate = raw.slice(0, 10);
    return isValidDateOnly(candidate) ? candidate : "";
  }
  if (TIMESTAMP_FIELDS.has(key)) return toLocalDateTimeInput(String(value));
  if (isArray && Array.isArray(value)) return value.join(", ");
  return String(value);
}

function normalizeDateOnly(value: unknown, field: string): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw.toLowerCase() === "dd") return null;
  const candidate = raw.slice(0, 10);
  if (!isValidDateOnly(candidate)) {
    throw new Error(`${field}: enter a real date or leave it empty.`);
  }
  return candidate;
}

function normalizeTimestamp(value: unknown, field: string): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw.toLowerCase() === "dd") return null;
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error(`${field}: choose a valid date and time or leave it empty.`);
  }
  return parsed.toISOString();
}

export function buildAdminPayload(table: string, source: AdminRecord): AdminRecord {
  const payload: AdminRecord = { ...source };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;

  const missing = (REQUIRED_FIELDS[table] ?? []).filter((field) => {
    const value = payload[field];
    return value === null || value === undefined ||
      (typeof value === "string" && value.trim().length === 0);
  });

  if (missing.length) {
    throw new Error(`Please complete the required field(s): ${missing.join(", ")}.`);
  }

  for (const field of DATE_ONLY_FIELDS) {
    if (field in payload) payload[field] = normalizeDateOnly(payload[field], field);
  }

  for (const field of TIMESTAMP_FIELDS) {
    if (field in payload) payload[field] = normalizeTimestamp(payload[field], field);
  }

  for (const field of NUMBER_FIELDS) {
    if (!(field in payload)) continue;
    const value = payload[field];
    if (value === "" || value === undefined) {
      payload[field] = null;
      continue;
    }
    if (value !== null && !Number.isFinite(Number(value))) {
      throw new Error(`${field}: enter a valid number or leave it empty.`);
    }
    if (value !== null) payload[field] = Number(value);
  }

  for (const field of EMAIL_FIELDS) {
    const value = payload[field];
    if (typeof value !== "string" || value.trim() === "") continue;
    const parts = value.trim().split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1].includes(".") || parts[1].startsWith(".") || parts[1].endsWith(".")) {
      throw new Error(`${field}: enter a valid email address.`);
    }
  }

  for (const field of URL_FIELDS) {
    const value = payload[field];
    if (typeof value !== "string" || value.trim() === "") continue;
    try {
      const parsed = new URL(value.trim(), "https://hades.invalid");
      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) throw new Error();
    } catch {
      throw new Error(`${field}: enter a valid web address.`);
    }
  }

  const enumRules: Record<string, Record<string, readonly string[]>> = {
    articles: { status: ["draft", "published"] },
    contact_messages: { status: ["unread", "read", "archived"] },
  };
  for (const [field, allowed] of Object.entries(enumRules[table] ?? {})) {
    if (typeof payload[field] === "string" && !allowed.includes(String(payload[field]))) {
      throw new Error(`${field}: choose one of the available options.`);
    }
  }

  return payload;
}