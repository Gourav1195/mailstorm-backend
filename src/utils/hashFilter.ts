import crypto from "crypto";

export function hashFilter(filter: any) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(filter))
    .digest("hex");
}
