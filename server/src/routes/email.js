const dns     = require('dns').promises;
const express = require('express');
const router  = express.Router();

router.get('/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ valid: false });

  const domain = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(domain);
    res.json({ valid: mx.length > 0 });
  } catch {
    res.json({ valid: false });
  }
});

module.exports = router;