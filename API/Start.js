const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// A secret string – change this to something random and keep it safe!
const SECRET = 'MySecretKey1234!';

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

  // Create a secure token that contains the key + expiry
  const payload = {
    key: entry.key,
    expiresAt: Date.now() + 10 * 60 * 1000  // 10 min valid
  };
  const token = crypto.createHmac('sha256', SECRET)
                     .update(JSON.stringify(payload))
                     .digest('hex');

  // Encode the payload and token together so we can verify later
  const combined = Buffer.from(JSON.stringify(payload)).toString('base64');
  const finalToken = `${token}.${combined}`;

  // Build reward URL
  const rewardUrl = `https://${req.headers.host}/reward.html?token=${encodeURIComponent(finalToken)}`;
  const lootlabsUrl = `https://lootlabs.gg/YOUR_LOOTLABS_ID?url=${encodeURIComponent(rewardUrl)}`;

  res.redirect(lootlabsUrl);
};
