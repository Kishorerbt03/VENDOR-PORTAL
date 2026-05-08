const sapService = require('../services/sapService');

exports.getProfile = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getProfile(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getProfile] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

exports.getRFQ = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getRFQ(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getRFQ] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

exports.getPO = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getPO(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getPO] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

exports.getGR = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getGR(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getGR] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

// Keeping the aggregate route for dashboard but using OData underneath
exports.getDashboardStats = async (req, res) => {
  const id = req.user ? req.user.vendor_id : (req.params.vendorId || req.query.vendorId);
  console.log('[getDashboardStats] Fetching for vendor ID:', id);
  try {
    const [rfq, po, gr, finance, memos] = await Promise.allSettled([
      sapService.getRFQ(id),
      sapService.getPO(id),
      sapService.getGR(id),
      sapService.getFinance(id),
      sapService.getMemos(id),
    ]);

    const rfqData   = rfq.status    === 'fulfilled' ? (Array.isArray(rfq.value)    ? rfq.value    : [rfq.value])    : [];
    const poData    = po.status     === 'fulfilled' ? (Array.isArray(po.value)     ? po.value     : [po.value])     : [];
    const grData    = gr.status     === 'fulfilled' ? (Array.isArray(gr.value)     ? gr.value     : [gr.value])     : [];
    const finData   = finance.status === 'fulfilled' ? (Array.isArray(finance.value) ? finance.value : [finance.value]) : [];
    const memoData  = memos.status  === 'fulfilled' ? (Array.isArray(memos.value)  ? memos.value  : [memos.value])  : [];

    console.log(`[getDashboardStats] Counts - RFQ:${rfqData.length}, PO:${poData.length}, GR:${grData.length}, Fin:${finData.length}, Memo:${memoData.length}`);

    // Real PO value from actual net_value field
    const poValue = poData.reduce((s, p) => s + (parseFloat(p.net_value) || 0), 0);

    // Open payables = DEBIT memos (amounts owed to vendor's creditors)
    const openPayable = memoData
      .filter(m => (m.type || '').toUpperCase() === 'DEBIT')
      .reduce((s, m) => s + (parseFloat(m.dmbtr) || 0), 0);

    console.log(`[getDashboardStats] Calculated - poValue:${poValue}, openPayable:${openPayable}`);

    // PO trend for chart
    const poTrend = poData.slice(0, 10).map(p => ({ label: p.po_no, value: p.net_value || 0 }));

    res.json({
      success: true,
      data: {
        openRFQ:       rfqData.length,
        totalRFQ:      rfqData.length,
        openPO:        poData.length,
        totalPO:       poData.length,
        totalGR:       grData.length,
        poValue,
        totalInvoices: finData.length,
        openPayable,
        poTrend,
      },
    });
  } catch (err) {
    console.error('[getDashboardStats] error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};
