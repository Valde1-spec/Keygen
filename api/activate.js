module.exports = async (req, res) => {
  const { key, userId } = req.query;
  if (!key || !userId) {
    res.status(400).json({ success: false, reason: 'Missing key or userId.' });
    return;
  }

  // Vercel Supabase integration provides these automatically
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ success: false, reason: 'Supabase not linked.' });
    return;
  }

  try {
    // 1. Check if key is already activated
    const checkUrl = `${SUPABASE_URL}/rest/v1/activations?key=eq.${encodeURIComponent(key)}&select=*`;
    const checkResp = await fetch(checkUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    const existing = checkResp.ok ? (await checkResp.json()) : [];

    if (existing.length > 0) {
      const entry = existing[0];
      const activatedAt = new Date(entry.activated_at).getTime();
      const now = Date.now();

      if (entry.user_id === userId && (now - activatedAt) <= 24 * 60 * 60 * 1000) {
        res.json({ success: true, expiresAt: activatedAt + 24 * 60 * 60 * 1000 });
        return;
      } else if (entry.user_id !== userId) {
        res.json({ success: false, reason: 'Key already used by another player.' });
        return;
      }
      // expired – delete old record so we can re‑activate
      const deleteUrl = `${SUPABASE_URL}/rest/v1/activations?id=eq.${entry.id}`;
      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });
    }

    // 2. Insert new activation
    const insertUrl = `${SUPABASE_URL}/rest/v1/activations`;
    const insertResp = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        key: key,
        user_id: userId,
        activated_at: new Date().toISOString()
      })
    });

    if (insertResp.ok) {
      const now = Date.now();
      res.json({ success: true, expiresAt: now + 24 * 60 * 60 * 1000 });
    } else {
      res.status(500).json({ success: false, reason: 'Database insert failed.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
