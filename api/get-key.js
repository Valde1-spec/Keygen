const crypto = require('crypto');
const SECRET = 'MySecretKey1234!';

module.exports = (req, res) => {
  const tokenParam = req.query.token;
  if (!tokenParam) { res.status(404).json({ error: 'Missing token.' }); return; }
  const [hmac, payloadBase64] = tokenParam.split('.');
  if (!hmac || !payloadBase64) { res.status(404).json({ error: 'Invalid token format.' }); return; }
  let payload;
  try { payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')); }
  catch(e) { res.status(404).json({ error: 'Corrupted token.' }); return; }
  const expectedHmac = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
  if (hmac !== expectedHmac) { res.status(404).json({ error: 'Token verification failed.' }); return; }
  if (Date.now() > payload.expiresAt) { res.status(410).json({ error: 'Token expired. Generate again.' }); return; }
  res.json({ key: payload.key });
};
