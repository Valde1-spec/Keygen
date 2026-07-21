module.exports = (req, res) => {
  const token = req.query.token;
  if (!token || !tokens[token]) {
    res.status(404).json({ error: 'Invalid link.' });
    return;
  }
  const data = tokens[token];
  if (data.used) {
    res.status(410).json({ error: 'Key already claimed.' });
    return;
  }
  if (Date.now() - data.createdAt > 10 * 60 * 1000) {
    res.status(410).json({ error: 'Link expired. Generate again.' });
    return;
  }
  tokens[token].used = true;
  res.json({ key: data.key });
};
