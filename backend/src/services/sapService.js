const axios = require('axios');

const ODATA_BASE_URL = process.env.SAP_ODATA_BASE_URL;
const SAP_USER = process.env.SAP_USER;
const SAP_PASS = process.env.SAP_PASS;

const getAxiosClient = (responseType = 'json') => {
  return axios.create({
    baseURL: ODATA_BASE_URL,
    auth: {
      username: SAP_USER,
      password: SAP_PASS,
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    responseType,
  });
};

const safeParseFloat = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const cleaned = v.toString().replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const parseDate = (v) => {
  if (!v) return null;
  // If already has dashes/ISO, just return the date part
  if (v.includes('-')) return v.split('T')[0];
  // If YYYYMMDD
  if (v.length === 8) return `${v.substring(0, 4)}-${v.substring(4, 6)}-${v.substring(6, 8)}`;
  return v;
};

const extractData = (response) => {
  const data = response.data;
  console.log('[sapService] Response data type:', typeof data, Array.isArray(data) ? 'Array' : 'Object');
  if (data && data.d) {
    return data.d.results ? data.d.results : data.d;
  }
  return data;
};

// Map OData PascalCase keys to frontend snake_case
const mapProfile = (d) => ({
  vendor_id: d.Lifnr || d.vendor_id,
  name: d.Name1 || d.name,
  city: d.City || d.city,
  country: d.Country || d.country,
  street: d.Street || d.street,
  postal_code: d.PostalCode || d.postal_code,
  telephone: d.Telephone || d.telephone,
  email: d.Email || d.email,
  currency: d.Currency || d.currency || 'INR'
});

const mapRFQ = (d) => ({
  rfq_no: d.Ebeln || d.rfq_no,
  bsart: d.Bsart || d.bsart,
  item_name: d.ItemName || d.item_name || 'N/A',
  rfq_date: parseDate(d.Bedat || d.rfq_date),
  purchasing_org: d.Ekorg || d.purchasing_org || 'N/A',
  quantity: safeParseFloat(d.Quantity || d.quantity || 0),
  unit: d.Unit || d.unit || 'PC',
  status: 'Open' // Adding status back as requested
});

const mapPO = (d) => ({
  po_no: d.Ebeln || d.po_no,
  bsart: d.Bsart || d.bsart,
  item_name: d.ItemName || d.item_name || 'N/A',
  po_date: parseDate(d.Bedat || d.po_date),
  net_value: safeParseFloat(d.Netwr || 0),
  quantity: safeParseFloat(d.Quantity || d.quantity || 0),
  unit: d.Unit || d.unit || 'PC',
  status: 'Open',
  currency: d.Waers || d.currency || 'INR'
});

const mapGR = (d) => ({
  gr_no: d.Mblnr || d.gr_no,
  gr_year: d.Mjahr || d.gr_year,
  item_name: d.ItemName || d.item_name || 'N/A',
  gr_date: parseDate(d.Budat || d.gr_date),
  material: d.Matnr || d.material || 'N/A',
  quantity: safeParseFloat(d.Menge || 0),
  uom: d.Meins || d.uom || 'PC'
});


const mapFinance = (d) => {
  console.log('[mapFinance] Mapping entry:', d.Belnr);
  const dmbtr = safeParseFloat(d.Dmbtr || 0);
  const type = d.Type || 'CREDIT';
  const sapStatus = (d.Status || '').toUpperCase();
  const aging = d.Aging || '';

  return {
    belnr: d.Belnr || d.belnr,
    gjahr: d.Gjahr || d.gjahr,
    lifnr: d.Lifnr || d.lifnr,
    bldat: parseDate(d.Bldat || d.bldat || d.Budat),
    budat: parseDate(d.Budat || d.budat),
    faedt: parseDate(d.Faedt || d.faedt || d.Budat || d.budat),
    blart: d.Blart || d.blart || (type === 'CREDIT' ? 'KG' : 'RE'),
    dmbtr: dmbtr,
    waers: d.Waers || d.waers || 'INR',
    status: sapStatus === 'CLEARED' ? 'Cleared' : 'Open',
    aging_days: aging === '90+' ? 91 : (aging === '31-60' ? 45 : (aging === '61-90' ? 75 : 15)),
    aging_bucket: aging ? (aging.includes('+') ? aging : aging + ' Days') : '0-30 Days',
    type: type
  };
};

exports.login = async (vendorId, password) => {
  const client = getAxiosClient();
  const url = `LoginSet?$filter=lifnr eq '${vendorId}' and password eq '${password}'`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    // Assuming data is an array and we take the first item, or it's a single object
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) throw new Error('Invalid response format');
    return result;
  } catch (err) {
    console.error('[sapService.login] Error:', err.message);
    throw err;
  }
};

exports.getProfile = async (vendorId) => {
  const client = getAxiosClient();
  const url = `VendorProfileSet(Lifnr='${vendorId}')?$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapProfile) : mapProfile(data);
  } catch (err) {
    console.error('[sapService.getProfile] Error:', err.message);
    throw err;
  }
};

exports.getPO = async (vendorId) => {
  const client = getAxiosClient();
  const url = `POSet?$filter=Lifnr eq '${vendorId}'&$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapPO) : [mapPO(data)];
  } catch (err) {
    console.error('[sapService.getPO] Error:', err.message);
    throw err;
  }
};

exports.getGR = async (vendorId) => {
  const client = getAxiosClient();
  const url = `GRSet?$filter=Lifnr eq '${vendorId}'&$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapGR) : [mapGR(data)];
  } catch (err) {
    console.error('[sapService.getGR] Error:', err.message);
    throw err;
  }
};

exports.getRFQ = async (vendorId) => {
  const client = getAxiosClient();
  const url = `RFQSet?$filter=Lifnr eq '${vendorId}'&$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapRFQ) : [mapRFQ(data)];
  } catch (err) {
    console.error('[sapService.getRFQ] Error:', err.message);
    throw err;
  }
};

exports.getFinance = async (vendorId) => {
  const client = getAxiosClient();
  const url = `FinanceSet?$filter=Lifnr eq '${vendorId}'&$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapFinance) : [mapFinance(data)];
  } catch (err) {
    console.error('[sapService.getFinance] Error:', err.message);
    throw err;
  }
};

exports.getMemos = async (vendorId) => {
  const client = getAxiosClient();
  const url = `MemoSet?$filter=Lifnr eq '${vendorId}'&$format=json`;
  try {
    const response = await client.get(url);
    const data = extractData(response);
    return Array.isArray(data) ? data.map(mapFinance) : [mapFinance(data)];
  } catch (err) {
    console.error('[sapService.getMemos] Error:', err.message);
    throw err;
  }
};

exports.getInvoicePdf = async (belnr) => {
  const client = axios.create({
    baseURL: ODATA_BASE_URL,
    auth: { username: SAP_USER, password: SAP_PASS },
    headers: {
      'Accept': 'application/pdf'
    },
    responseType: 'arraybuffer',
  });

  const url = `InvoicePDFSet(Belnr='${belnr}')/$value`;

  try {
    const response = await client.get(url);

    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Empty PDF response from SAP');
    }

    const buffer = Buffer.from(response.data);

    // ✅ Validate PDF (important)
    if (buffer.toString('utf8', 0, 5) !== '%PDF-') {
      const errorText = buffer.toString('utf8').substring(0, 200);
      throw new Error('Invalid PDF returned from SAP: ' + errorText);
    }

    return buffer;

  } catch (err) {
    console.error('[sapService.getInvoicePdf] Error:', err.message);
    throw err;
  }
};

