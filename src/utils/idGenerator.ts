import crypto from "crypto";

export const generateIngestionId = (): string => {
  return crypto.randomBytes(8).toString("hex");
};
