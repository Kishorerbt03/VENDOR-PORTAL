const jwt = require('jsonwebtoken');
const sapService = require('../services/sapService');

exports.login = async (req, res) => {
  const { vendorId, password } = req.query;
  if (!vendorId || !password) {
    return res.status(400).json({ success: false, message: 'vendorId and password are required' });
  }

  try {
    const result = await sapService.login(vendorId, password);

    // Verify response from OData. Assuming it returns something or fails.
    // If we reach here, the call succeeded.
    
    // Attempt to get name from profile for JWT
    let vendorName = vendorId;
    try {
      const profileData = await sapService.getProfile(vendorId);
      const profile = Array.isArray(profileData) ? profileData[0] : profileData;
      if (profile && profile.Name1) vendorName = profile.Name1;
    } catch (_) { /* ignore */ }

    const token = jwt.sign(
      { vendor_id: vendorId, name: vendorName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      token,
      vendor: { vendor_id: vendorId, name: vendorName, email: '', currency: 'INR' },
    });
  } catch (err) {
    console.error('[login] OData error:', err.message);
    res.status(401).json({ success: false, message: 'Invalid Vendor ID or password. ' + err.message });
  }
};
