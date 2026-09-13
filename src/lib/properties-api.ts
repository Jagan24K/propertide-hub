export const API_BASE_URL =
  "https://propertymanagementapi-60087170674.development.catalystserverless.in/properties";

export type PropertyType = "Apartment" | "Villa" | "Independent House";
export type PropertyStatus = "Available" | "Sold";

export interface Property {
  ROWID: string;
  PROPERTY_NAME: string;
  LOCATION: string;
  PRICE: number;
  PROPERTY_TYPE: string;
  STATUS: string;
}

export interface PropertyInput {
  property_name: string;
  location: string;
  price: string;
  property_type: string;
  status: string;
}

function buildUrl(params: Record<string, string>) {
  const url = new URL(API_BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

async function request(method: string, params: Record<string, string>) {
  let res: Response;
  try {
    res = await fetch(buildUrl(params), { method });
  } catch {
    throw new Error(
      "Could not reach the property service. Please check your connection and try again.",
    );
  }
  if (!res.ok) {
    throw new Error(`The property service responded with an error (${res.status}).`);
  }
  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    return {} as Record<string, unknown>;
  }

  // Catalyst API Gateway wraps the function response inside an "output" string.
  let data = unwrap(payload);
  if (data && typeof data === "object" && "output" in (data as Record<string, unknown>)) {
    data = unwrap((data as Record<string, unknown>)["output"]);
  }

  const obj = (data ?? {}) as Record<string, unknown>;
  if (obj["success"] === false) {
    throw new Error(
      typeof obj["message"] === "string"
        ? obj["message"]
        : "The property service could not complete the request.",
    );
  }
  return obj;
}

function unwrap(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalize(row: Record<string, unknown>): Property {
  const rawPrice = row?.["PRICE"];
  const price =
    typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice ?? "").replace(/[^0-9.]/g, ""));
  return {
    ROWID: String(row?.["ROWID"] ?? ""),
    PROPERTY_NAME: String(row?.["PROPERTY_NAME"] ?? ""),
    LOCATION: String(row?.["LOCATION"] ?? ""),
    PRICE: Number.isFinite(price) ? price : 0,
    PROPERTY_TYPE: String(row?.["PROPERTY_TYPE"] ?? ""),
    STATUS: String(row?.["STATUS"] ?? ""),
  };
}

export async function fetchProperties(): Promise<Property[]> {
  const data = await request("GET", { action: "get" });
  const list = Array.isArray(data?.properties)
    ? data.properties
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return list.filter(Boolean).map(normalize);
}

export async function createProperty(input: PropertyInput) {
  return request("POST", { action: "create", ...input });
}

export async function updateProperty(rowId: string, input: PropertyInput) {
  return request("PUT", { action: "update", row_id: rowId, ...input });
}

export async function deleteProperty(rowId: string) {
  return request("DELETE", { action: "delete", row_id: rowId });
}

export function formatINR(value: number) {
  if (!Number.isFinite(value)) return "₹0";
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
