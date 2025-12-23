const express = require('express');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Simple cache for resume parsing
let cachedResume = null;
let cachedAt = 0;
const CACHE_MS = 1000 * 60 * 10; // 10 minutes

app.get('/api/resume', async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedResume && now - cachedAt < CACHE_MS) {
      return res.json(cachedResume);
    }

    const resumePath = path.join(__dirname, 'public', 'resume.pdf');
    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ error: 'resume.pdf not found in public/' });
    }

    const buffer = fs.readFileSync(resumePath);
    const data = await pdfParse(buffer);
    const text = (data.text || '').replace(/\r/g, '');

    const parsed = parseResumeText(text);
    cachedResume = parsed;
    cachedAt = now;
    res.json(parsed);
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

function parseResumeText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const expStart = findIndexCI(lines, /^(experience|work experience|professional experience)$/i);
  let expEnd = lines.length;
  const headings = [/^education$/i, /^projects$/i, /^skills$/i, /^awards/i, /^certifications/i, /^activities$/i];
  for (const h of headings) {
    const idx = findIndexCI(lines, h, expStart + 1);
    if (idx !== -1) { expEnd = Math.min(expEnd, idx); }
  }
  const expSlice = (expStart !== -1) ? lines.slice(expStart + 1, expEnd) : [];

  const experiences = [];
  let current = null;
  const bulletRx = /^(?:[•\-\u25B9\u2022]|\*)\s*(.+)$/; // • - ▹ • *
  const dateRx = /(\b\w{3,9}\s\d{4}|\b\d{4})(?:\s*[–-]\s*(\b\w{3,9}\s\d{4}|\bPresent\b|\b\d{4}))?/i;

  for (const l of expSlice) {
    const mBullet = l.match(bulletRx);
    if (mBullet) {
      if (!current) current = { role: '', company: '', dates: '', bullets: [] };
      current.bullets.push(mBullet[1]);
      continue;
    }

    const hasDate = dateRx.test(l);
    const parts = l.split(/[–\-•|·]/).map(s => s.trim()).filter(Boolean);
    if (hasDate || (parts.length >= 2 && /intern|engineer|developer/i.test(l))) {
      if (current && (current.role || current.company || current.bullets.length)) {
        experiences.push(current);
      }
      current = { role: '', company: '', dates: '', bullets: [] };

      const dateMatch = l.match(dateRx);
      if (dateMatch) current.dates = dateMatch[0].replace(/\s+/g, ' ').trim();

      let roleCandidate = '', companyCandidate = '';
      if (parts.length >= 2) {
        if (/intern|engineer|developer|manager|research/i.test(parts[0])) {
          roleCandidate = parts[0];
          companyCandidate = parts[1];
        } else if (/intern|engineer|developer|manager|research/i.test(parts[1])) {
          roleCandidate = parts[1];
          companyCandidate = parts[0];
        } else {
          companyCandidate = parts[0];
          roleCandidate = parts[1];
        }
      } else {
        roleCandidate = l;
      }
      current.role = roleCandidate.trim();
      current.company = companyCandidate.trim();
      continue;
    }
  }
  if (current && (current.role || current.company || current.bullets.length)) {
    experiences.push(current);
  }
  return { experiences };
}

function findIndexCI(arr, rx, from = 0) {
  for (let i = from; i < arr.length; i++) {
    if (rx.test(arr[i])) return i;
  }
  return -1;
}

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Personal site running on http://localhost:${PORT}`);
});