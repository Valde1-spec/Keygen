const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const SECRET = 'MySecretKey1234!';

module.exports = (req, res) => {
  const keysPath = path.join(process.cwd(), 'keys.json');
  let keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
  const entry = keys.find(k => k.status === 'unused');
  if (!entry) { res.status(410).send('No keys left.'); return; }
  entry.status = 'assigned';
  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

  const payload = { key: entry.key, expiresAt: Date.now() + 10*60*1000 };
  const token = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
  const combined = Buffer.from(JSON.stringify(payload)).toString('base64');
  const finalToken = `${token}.${combined}`;
  const rewardUrl = `https://${req.headers.host}/reward.html?token=${encodeURIComponent(finalToken)}`;
  const lootlabsUrl = `https://loot-link.com/s?FIJ9MsmJ&url=${encodeURIComponent(rewardUrl)}`;
  res.redirect(lootlabsUrl);
};
