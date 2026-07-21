const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SECRET = 'MySecretKey1234!';                // same as in start.js
const PREMIUM_CODE = 'iceandfire';                // the secret password

module.exports = async (req, res) => {
  try {
    const { code } = req.query;
    if (code !== PREMIUM_CODE) {
      res.status(403).send('Invalid code.');
      return;
    }

    const keysPath = path.join(__dirname, '..', 'keys.json');
    const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

    // Pick a random key
    const entry = keys[Math.floor(Math.random() * keys.length)];

    // Create secure token (same logic as start.js)
    const payload = {
      key: entry.key,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    const hmac = crypto.createHmac('sha256', SECRET)
                       .update(JSON.stringify(payload))
                       .digest('hex');
    const token = `${hmac}.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;

    // Redirect directly to reward page – no Linkvertise
    const rewardUrl = `https://${req.headers.host}/reward.html?token=${encodeURIComponent(token)}`;
    res.redirect(rewardUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
