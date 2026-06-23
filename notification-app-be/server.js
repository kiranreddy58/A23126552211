import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Log from '../logging/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[match[1]] = val.trim();
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const BASE_URL = 'http://4.224.186.213';

app.post('/evaluation-service/auth', async (req, res) => {
  try {
    await Log('backend', 'info', 'route', 'Auth started');
    const response = await fetch(`${BASE_URL}/evaluation-service/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    await Log('backend', 'error', 'route', 'Auth error: ' + e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/evaluation-service/logs', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/evaluation-service/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || ''
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/evaluation-service/notifications', async (req, res) => {
  try {
    await Log('backend', 'info', 'route', 'Fetching notifications');
    const query = new URLSearchParams(req.query).toString();
    const response = await fetch(`${BASE_URL}/evaluation-service/notifications?${query}`, {
      headers: {
        'Authorization': req.headers.authorization || '',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    await Log('backend', 'error', 'route', 'Fetch error: ' + e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  Log('backend', 'info', 'config', 'Server running on ' + PORT).catch(() => {});
});
