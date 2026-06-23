const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

const STACKS = new Set(["backend", "frontend"]);
const LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);

const BE_PKGS = new Set(["cache", "controller", "cron_job", "domain", "handler", "repository", "route", "service"]);
const FE_PKGS = new Set(["api", "component", "hook", "page", "state", "style"]);
const COMMON_PKGS = new Set(["auth", "config", "middleware", "utils"]);

let token = "";

function env(key) {
  if (typeof process !== "undefined" && process.env && process.env[key]) return process.env[key];
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  return "";
}

export async function getOrFetchToken() {
  if (token) return token;

  const email = env("VITE_EMAIL");
  const clientID = env("VITE_CLIENT_ID");
  const clientSecret = env("VITE_CLIENT_SECRET");

  if (email && clientID && clientSecret) {
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: env("VITE_NAME"),
          rollNo: env("VITE_ROLL_NO"),
          accessCode: env("VITE_ACCESS_CODE"),
          clientID,
          clientSecret
        })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.access_token;
        return token;
      }
    } catch (e) {
      console.warn("Auth fallback:", e.message);
    }
  }

  token = env("VITE_ACCESS_TOKEN");
  return token;
}

function validate(stack, level, pkg, message) {
  if (!STACKS.has(stack)) throw new Error("Invalid stack: " + stack);
  if (!LEVELS.has(level)) throw new Error("Invalid level: " + level);
  if (!COMMON_PKGS.has(pkg)) {
    if (stack === "backend" && !BE_PKGS.has(pkg)) throw new Error("Invalid package: " + pkg);
    if (stack === "frontend" && !FE_PKGS.has(pkg)) throw new Error("Invalid package: " + pkg);
  }
  if (!message || typeof message !== "string") throw new Error("Message required");
}

export default async function Log(stack, level, pkg, message) {
  try {
    validate(stack, level, pkg, message);
    const t = await getOrFetchToken();
    const msg = message.length > 48 ? message.substring(0, 45) + "..." : message;

    const method = level === "error" || level === "fatal" ? "error" : level === "warn" ? "warn" : "log";
    console[method](`[${stack}][${level}][${pkg}] ${msg}`);

    const res = await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + t
      },
      body: JSON.stringify({ stack, level, package: pkg, message: msg })
    });

    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401) token = "";
      return { success: false, status: res.status, error: err };
    }

    return { success: true, data: await res.json() };
  } catch (e) {
    console.error("Log failed:", e.message);
    return { success: false, error: e.message };
  }
}
