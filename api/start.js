const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRET = 'MySecretKey1234!';  // change this
const LOOTLABS_URL = 'https://loot-link.com/s?FIJ9MsmJ';

module.exports = async (req, res) => {
  try {
    // Read keys (only once, file never changes)
    const keysPath = path.join(__dirname, '..', 'keys.json');
    const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

    // Pick a random key – no need to mark it as used
    const entry = keys[Math.floor(Math.random() * keys.length)];

    // Create a secure token so only Loot‑Link finishers can see the key
    const payload = {
      key: entry.key,
      expiresAt: Date.now() + 10 * 60 * 1000  // token valid for 10 min
    };
    const hmac = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
    const token = `${hmac}.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;

    const rewardUrl = `https://${req.headers.host}/reward.html?token=${encodeURIComponent(token)}`;
    const lootUrl = `${LOOTLABS_URL}&url=${encodeURIComponent(rewardUrl)}`;
    res.redirect(lootUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
