import {normalizeString} from "./normalize-string.js";

const MIN_PASSWORD_LENGTH = 6;

export const getNormalizedCredentials = (args) => {
  try {
    const email = args?.email;
    const password = args?.password;

    if (!email || !password) return null;

    if (typeof email !== "string") return null;

    if (typeof password !== "string") return null;

    if (!email.includes("@")) return null;

    return password?.trim().length >= MIN_PASSWORD_LENGTH ? {
      email: normalizeString(email),
      password: password.trim()
    } : null;
  } catch {
    return null;
  }
}