const fs = require('fs');
const path = require('path');
const EXPIRY_MS = 24 * 60 * 60 * 1000;

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { key, userId } = JSON.parse(body);
    if (!key || !userId) {
      res.status(400).json({ success: false, reason: 'Missing info.' });
      return;
    }
    const keysPath = path.join(process.cwd(), 'keys.json');
    let keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    const entry = keys.find(k => k.key === key);
    if (!entry) {
      res.json({ success: false, reason: 'Invalid key.' });
      return;
    }
    const now = Date.now();
    if (entry.status === 'active') {
      if (entry.userId === userId) {
        if (now - entry.activatedAt <= EXPIRY_MS) {
          res.json({ success: true, expiresAt: entry.activatedAt + EXPIRY_MS });
        } else {
          entry.status = 'expired';
          fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
          res.json({ success: false, reason: 'Expired.' });
        }
      } else {
        res.json({ success: false, reason: 'Key already used by someone else.' });
      }
      return;
    }
    if (entry.status === 'unused' || entry.status === 'assigned') {
      entry.status = 'active';
      entry.userId = userId;
      entry.activatedAt = now;
      fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
      res.json({ success: true, expiresAt: now + EXPIRY_MS });
      return;
    }
    res.json({ success: false, reason: 'Cannot activate.' });
  });
};
