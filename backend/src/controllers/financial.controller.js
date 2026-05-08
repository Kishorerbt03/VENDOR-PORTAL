const sapService = require('../services/sapService');

exports.getInvoices = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getFinance(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getInvoices] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

exports.getAging = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const raw = await sapService.getFinance(vendorId);
    const today = new Date();

    // Handle empty data safely
    const rawData = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    const rows = rawData.map(r => {
      const postDate = r.budat ? new Date(r.budat) : today;
      const agingDays = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));
      let bucket;
      if (agingDays < 0) bucket = 'Not Due';
      else if (agingDays <= 30) bucket = '0–30 Days';
      else if (agingDays <= 60) bucket = '31–60 Days';
      else if (agingDays <= 90) bucket = '61–90 Days';
      else bucket = '90+ Days';

      return { ...r, aging_days: agingDays, aging_bucket: bucket };
    });

    // Build summary buckets
    const buckets = {};
    rows.forEach(r => {
      buckets[r.aging_bucket] = (buckets[r.aging_bucket] || 0) + (r.dmbtr || 0);
    });

    res.json({ success: true, data: rows, summary: buckets });
  } catch (err) {
    console.error('[getAging] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

exports.getMemos = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const data = await sapService.getMemos(vendorId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getMemos] OData error:', err.message);
    res.status(502).json({ success: false, message: 'SAP service error: ' + err.message });
  }
};

// GET /api/invoice/:vendorId/:belnr/:gjahr  — PDF for this vendor — streams directly to browser
exports.getInvoicePDF = async (req, res) => {
  const { belnr } = req.params;

  try {
    const pdfBuffer = await sapService.getInvoicePdf(belnr);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No PDF returned from SAP.'
      });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${belnr}.pdf`,
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error('[getInvoicePDF] Error:', err.message);

    res.status(502).json({
      success: false,
      message: 'SAP service error: ' + err.message
    });
  }
};
