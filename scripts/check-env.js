/**
 * Cek env golden (frontend). Jalankan dari folder golden: node scripts/check-env.js
 * Membaca .env tanpa dependency tambahan.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");

if (!fs.existsSync(envPath)) {
  console.error("❌ golden env: file .env tidak ditemukan di", path.dirname(envPath));
  process.exit(1);
}

const env = {};
const content = fs.readFileSync(envPath, "utf8");
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const raw = trimmed.slice(eq + 1).trim();
  const value = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  env[key] = value;
}

const required = ["VITE_API_BASE_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missing = required.filter((k) => !env[k]?.trim());
if (missing.length > 0) {
  console.error("❌ golden env: missing required:", missing.join(", "));
  process.exit(1);
}

console.log("✅ golden env OK");
console.log("   VITE_API_BASE_URL:", env.VITE_API_BASE_URL);
console.log("   VITE_SUPABASE_URL:", env.VITE_SUPABASE_URL);
console.log("   VITE_SUPABASE_ANON_KEY: set (" + (env.VITE_SUPABASE_ANON_KEY?.length ?? 0) + " chars)");
