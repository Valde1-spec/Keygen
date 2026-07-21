const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Temporary token storage (server memory – fine for small scale)
let tokens = {};

module.exports = (req, res) => {
  const keysPath = path.join(process.cwd(), 'keys.json');
  let keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

  // Find first unused key
  const entry = keys.find(k => k.status === 'unused');
  if (!entry) {
    res.status(410).send('No keys left.');
    return;
  }

  // Mark as assigned
  entry.status = 'assigned';
  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

  const token = crypto.randomBytes(16).toString('hex');
  tokens[token] = { key: entry.key, used: false, createdAt: Date.now() };

  // Build reward URL
  const rewardUrl = `https://${req.headers.host}/reward.html?token=${token}`;
  const lootlabsUrl = `https://lootlabs.gg/YOUR_LOOTLABS_ID?url=${encodeURIComponent(rewardUrl)}`;

  res.redirect(lootlabsUrl);
};
