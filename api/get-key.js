const crypto = require('crypto');
const SECRET = 'MySecretKey1234!';

module.exports = (req, res) => {
  try {
    const tokenParam = req.query.token;
    if (!tokenParam) return res.status(404).json({ error: 'Missing token.' });

    const [hmac, payloadBase64] = tokenParam.split('.');
    if (!hmac || !payloadBase64) return res.status(404).json({ error: 'Invalid token.' });

    let payload;
    try {
      payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    } catch (e) {
      return res.status(404).json({ error: 'Corrupted token.' });
    }

    const expectedHmac = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
    if (hmac !== expectedHmac) return res.status(404).json({ error: 'Invalid token.' });

    if (Date.now() > payload.expiresAt) return res.status(410).json({ error: 'Token expired.' });

    // Token is valid – return the key
    res.json({ key: payload.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
