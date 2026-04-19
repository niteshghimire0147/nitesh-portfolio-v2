import fs   from 'fs';
import path from 'path';

const LOG_DIR = path.resolve('./logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function todayFile() {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `security-${date}.log`);
}

// Keep only last 30 days of logs
function pruneOldLogs() {
  try {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    fs.readdirSync(LOG_DIR)
      .filter(f => f.startsWith('security-') && f.endsWith('.log'))
      .forEach(f => {
        const full = path.join(LOG_DIR, f);
        if (fs.statSync(full).mtimeMs < cutoff) fs.unlinkSync(full);
      });
  } catch { /* non-fatal */ }
}

// Prune on startup
pruneOldLogs();

export function logSecurityEvent(type, data = {}) {
  const entry = JSON.stringify({ ts: new Date().toISOString(), type, ...data }) + '\n';
  try {
    fs.appendFileSync(todayFile(), entry, 'utf8');
  } catch (writeErr) {
    process.stderr.write(`[SEC-LOGGER] Failed to write log: ${writeErr.message}\n`);
  }
  console.warn(`[SEC] ${type}`, data);
}
