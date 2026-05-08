const router = require('express').Router();
const sapService = require('../services/sapService');

// Quick ping of all OData services
// GET /api/debug/all?lifnr=0000100000
router.get('/all', async (req, res) => {
  const { lifnr = '0000100000' } = req.query;

  const results = {};

  try {
    const [profile, po, gr, rfq, finance, memos] = await Promise.allSettled([
      sapService.getProfile(lifnr),
      sapService.getPO(lifnr),
      sapService.getGR(lifnr),
      sapService.getRFQ(lifnr),
      sapService.getFinance(lifnr),
      sapService.getMemos(lifnr)
    ]);

    results['Profile'] = profile.status === 'fulfilled' ? { success: true, data: profile.value } : { error: profile.reason?.message };
    results['PO'] = po.status === 'fulfilled' ? { success: true, data: po.value } : { error: po.reason?.message };
    results['GR'] = gr.status === 'fulfilled' ? { success: true, data: gr.value } : { error: gr.reason?.message };
    results['RFQ'] = rfq.status === 'fulfilled' ? { success: true, data: rfq.value } : { error: rfq.reason?.message };
    results['Finance'] = finance.status === 'fulfilled' ? { success: true, data: finance.value } : { error: finance.reason?.message };
    results['Memos'] = memos.status === 'fulfilled' ? { success: true, data: memos.value } : { error: memos.reason?.message };

  } catch (err) {
    results['GlobalError'] = err.message;
  }

  res.json({ lifnr, sapBase: process.env.SAP_ODATA_BASE_URL, results });
});

module.exports = router;
