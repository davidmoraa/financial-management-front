import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFromFile = readEnvFile(resolve(process.cwd(), ".env.production"));
const env = {
  ...envFromFile,
  ...process.env,
};

const requiredVariables = ["VITE_API_BASE_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const errors = [];

for (const variableName of requiredVariables) {
  if (!env[variableName]) {
    errors.push(`${variableName} is required for production builds.`);
  }
}

if (env.VITE_API_BASE_URL && !isHttpsUrl(env.VITE_API_BASE_URL)) {
  errors.push("VITE_API_BASE_URL must be an https URL for production builds.");
}

if (env.VITE_API_BASE_URL && isLocalUrl(env.VITE_API_BASE_URL)) {
  errors.push("VITE_API_BASE_URL cannot point to localhost or 127.0.0.1 in production builds.");
}

if (env.VITE_SUPABASE_URL && !isHttpsUrl(env.VITE_SUPABASE_URL)) {
  errors.push("VITE_SUPABASE_URL must be an https URL for production builds.");
}

if (errors.length > 0) {
  console.error("Invalid frontend production environment:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return values;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex < 0) {
        return values;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
      values[key] = stripQuotes(rawValue);
      return values;
    }, {});
}

function stripQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isLocalUrl(value) {
  try {
    const { hostname } = new URL(value);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
