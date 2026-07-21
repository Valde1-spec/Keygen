const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRET = 'MySecretKey1234!';                   // change this to your own secret
const LINKVERTISE_URL = 'https://link-center.net/7677470/MhgX3ucFm9JV';

module.exports = async (req, res) => {
  try {
    const keysPath = path.join(__dirname, '..', 'keys.json');
    const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

    // Pick a random key
    const entry = keys[Math.floor(Math.random() * keys.length)];

    // Create a secure token (valid for 10 minutes)
    const payload = { key: entry.key, expiresAt: Date.now() + 10 * 60 * 1000 };
    const hmac = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
    const token = `${hmac}.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;

    // Build reward URL (where the user goes AFTER the ad)
    const rewardUrl = `https://${req.headers.host}/reward.html?token=${encodeURIComponent(token)}`;
    // Pass reward URL as a query parameter so Linkvertise redirects there
    const linkvertiseUrl = `${LINKVERTISE_URL}?url=${encodeURIComponent(rewardUrl)}`;

    res.redirect(linkvertiseUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
