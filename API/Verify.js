const fs = require('fs');
const path = require('path');
const EXPIRY_MS = 24 * 60 * 60 * 1000;

module.exports = (req, res) => {
  const { key, userId } = req.query;
  if (!key || !userId) {
    res.status(400).json({ valid: false, reason: 'Missing params.' });
    return;
  }
  const keysPath = path.join(process.cwd(), 'keys.json');
  let keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
  const entry = keys.find(k => k.key === key);
  if (!entry) {
    res.json({ valid: false, reason: 'Invalid key.' });
    return;
  }
  if (entry.status === 'active' && entry.userId === userId) {
    if (Date.now() - entry.activatedAt <= EXPIRY_MS) {
      res.json({ valid: true, expiresAt: entry.activatedAt + EXPIRY_MS });
    } else {
      entry.status = 'expired';
      fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
      res.json({ valid: false, reason: 'Expired.' });
    }
  } else {
    res.json({ valid: false, reason: 'Not valid.' });
  }
};
