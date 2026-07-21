const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ valid: false, reason: 'Missing key.' });

    const keysPath = path.join(__dirname, '..', 'keys.json');
    const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    const found = keys.some(k => k.key === key);
    if (found) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false, reason: 'Invalid key.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
