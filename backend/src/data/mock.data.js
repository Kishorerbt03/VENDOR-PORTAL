const bcrypt = require('bcryptjs');

const HASH = bcrypt.hashSync('Password@123', 10);

const vendors = [
  {
    vendor_id: '0000100001',
    zpassword: HASH,
    zis_active: 'X',
    name: 'Acme Industries Ltd.',
    street: '14 Industrial Park Road',
    city: 'Mumbai',
    country: 'IN',
    postal_code: '400001',
    telephone: '+91-22-40001234',
    email: 'procurement@acme.in',
    currency: 'INR',
    payment_terms: 'NT30',
    company_code: '1000',
    tax_id: '27AAACA1234B1ZX',
    bank_account: 'HDFC0001234',
    category: 'Raw Materials',
    rating: 4.5,
  },
  {
    vendor_id: '0000100002',
    zpassword: HASH,
    zis_active: 'X',
    name: 'Global Tech Suppliers',
    street: '7 Electronics Hub, Sector 18',
    city: 'Bengaluru',
    country: 'IN',
    postal_code: '560001',
    telephone: '+91-80-50001234',
    email: 'orders@globaltech.in',
    currency: 'INR',
    payment_terms: 'NT45',
    company_code: '1000',
    tax_id: '29AABCG5678D1ZY',
    bank_account: 'ICIC0005678',
    category: 'Electronics',
    rating: 4.2,
  },
];

const rfqData = {
  '0000100001': [
    { rfq_no: 'RFQ-2024-0001', material: 'Steel Rods Grade A', qty: 500, unit: 'KG', deadline: '2024-08-15', status: 'Open', amount: 125000 },
    { rfq_no: 'RFQ-2024-0002', material: 'Aluminium Sheets', qty: 200, unit: 'KG', deadline: '2024-08-20', status: 'Quoted', amount: 98000 },
    { rfq_no: 'RFQ-2024-0003', material: 'Copper Wire 2mm', qty: 1000, unit: 'MTR', deadline: '2024-08-25', status: 'Closed', amount: 43500 },
    { rfq_no: 'RFQ-2024-0004', material: 'Mild Steel Plates', qty: 300, unit: 'KG', deadline: '2024-09-01', status: 'Open', amount: 78000 },
    { rfq_no: 'RFQ-2024-0005', material: 'Iron Bolts M12', qty: 5000, unit: 'EA', deadline: '2024-09-10', status: 'Quoted', amount: 15000 },
  ],
  '0000100002': [
    { rfq_no: 'RFQ-2024-0010', material: 'PCB Boards 6-Layer', qty: 100, unit: 'EA', deadline: '2024-08-18', status: 'Open', amount: 220000 },
    { rfq_no: 'RFQ-2024-0011', material: 'MOSFET Transistors', qty: 2000, unit: 'EA', deadline: '2024-08-22', status: 'Quoted', amount: 36000 },
  ],
};

const poData = {
  '0000100001': [
    { po_no: 'PO-2024-4501', material: 'Steel Rods Grade A', qty: 500, unit: 'KG', po_date: '2024-07-01', delivery_date: '2024-07-20', net_value: 125000, currency: 'INR', status: 'Open', plant: '1010' },
    { po_no: 'PO-2024-4502', material: 'Aluminium Sheets', qty: 200, unit: 'KG', po_date: '2024-07-05', delivery_date: '2024-07-25', net_value: 98000, currency: 'INR', status: 'Partially Delivered', plant: '1010' },
    { po_no: 'PO-2024-4503', material: 'Copper Wire 2mm', qty: 1000, unit: 'MTR', po_date: '2024-07-10', delivery_date: '2024-07-30', net_value: 43500, currency: 'INR', status: 'Closed', plant: '1010' },
    { po_no: 'PO-2024-4510', material: 'Mild Steel Plates', qty: 300, unit: 'KG', po_date: '2024-07-15', delivery_date: '2024-08-05', net_value: 78000, currency: 'INR', status: 'Open', plant: '1010' },
  ],
  '0000100002': [
    { po_no: 'PO-2024-4520', material: 'PCB Boards 6-Layer', qty: 100, unit: 'EA', po_date: '2024-07-02', delivery_date: '2024-07-22', net_value: 220000, currency: 'INR', status: 'Open', plant: '1020' },
    { po_no: 'PO-2024-4521', material: 'MOSFET Transistors', qty: 2000, unit: 'EA', po_date: '2024-07-08', delivery_date: '2024-07-28', net_value: 36000, currency: 'INR', status: 'Closed', plant: '1020' },
  ],
};

const grData = {
  '0000100001': [
    { gr_no: 'GR-2024-7001', po_no: 'PO-2024-4502', material: 'Aluminium Sheets', qty_received: 100, unit: 'KG', gr_date: '2024-07-18', plant: '1010', storage_loc: '0001', movement_type: '101' },
    { gr_no: 'GR-2024-7002', po_no: 'PO-2024-4503', material: 'Copper Wire 2mm', qty_received: 1000, unit: 'MTR', gr_date: '2024-07-28', plant: '1010', storage_loc: '0001', movement_type: '101' },
  ],
  '0000100002': [
    { gr_no: 'GR-2024-7010', po_no: 'PO-2024-4521', material: 'MOSFET Transistors', qty_received: 2000, unit: 'EA', gr_date: '2024-07-26', plant: '1020', storage_loc: '0002', movement_type: '101' },
  ],
};

const invoiceData = {
  '0000100001': [
    { belnr: '5100000001', gjahr: '2024', bldat: '2024-07-18', budat: '2024-07-18', faedt: '2024-08-17', lifnr: '0000100001', blart: 'RE', dmbtr: 49000, waers: 'INR', mwskz: 'V0', xblnr: 'INV-ACME-2024-001', sgtxt: 'Aluminium Sheets – partial delivery', ebeln: 'PO-2024-4502', status: 'Open' },
    { belnr: '5100000002', gjahr: '2024', bldat: '2024-07-28', budat: '2024-07-29', faedt: '2024-08-27', lifnr: '0000100001', blart: 'RE', dmbtr: 43500, waers: 'INR', mwskz: 'V0', xblnr: 'INV-ACME-2024-002', sgtxt: 'Copper Wire 2mm – full delivery', ebeln: 'PO-2024-4503', status: 'Cleared' },
    { belnr: '5100000003', gjahr: '2024', bldat: '2024-06-15', budat: '2024-06-15', faedt: '2024-07-15', lifnr: '0000100001', blart: 'KG', dmbtr: -5000, waers: 'INR', mwskz: 'V0', xblnr: 'CRMEMO-001', sgtxt: 'Quality defect credit – batch 240612', ebeln: '', status: 'Cleared' },
    { belnr: '5100000004', gjahr: '2024', bldat: '2024-05-10', budat: '2024-05-10', faedt: '2024-06-09', lifnr: '0000100001', blart: 'RE', dmbtr: 31000, waers: 'INR', mwskz: 'V0', xblnr: 'INV-ACME-2024-004', sgtxt: 'Mild Steel Plates – advance billing', ebeln: 'PO-2024-4510', status: 'Open' },
    { belnr: '5100000005', gjahr: '2024', bldat: '2024-04-01', budat: '2024-04-02', faedt: '2024-05-01', lifnr: '0000100001', blart: 'KL', dmbtr: 8500, waers: 'INR', mwskz: 'V0', xblnr: 'DRMEMO-001', sgtxt: 'Price revision debit – April batch', ebeln: '', status: 'Cleared' },
  ],
  '0000100002': [
    { belnr: '5100000010', gjahr: '2024', bldat: '2024-07-26', budat: '2024-07-26', faedt: '2024-09-09', lifnr: '0000100002', blart: 'RE', dmbtr: 36000, waers: 'INR', mwskz: 'V0', xblnr: 'GT-INV-2024-010', sgtxt: 'MOSFET Transistors batch delivery', ebeln: 'PO-2024-4521', status: 'Cleared' },
    { belnr: '5100000011', gjahr: '2024', bldat: '2024-07-10', budat: '2024-07-10', faedt: '2024-08-24', lifnr: '0000100002', blart: 'RE', dmbtr: 42000, waers: 'INR', mwskz: 'V0', xblnr: 'GT-INV-2024-011', sgtxt: 'PCB Boards 6-Layer partial shipment', ebeln: 'PO-2024-4520', status: 'Open' },
  ],
};

const agingData = {
  '0000100001': [
    { belnr: '5100000001', gjahr: '2024', lifnr: '0000100001', bldat: '2024-07-18', faedt: '2024-08-17', dmbtr: 49000, waers: 'INR', aging_days: 30, aging_bucket: '0–30 Days' },
    { belnr: '5100000004', gjahr: '2024', lifnr: '0000100001', bldat: '2024-05-10', faedt: '2024-06-09', dmbtr: 31000, waers: 'INR', aging_days: 60, aging_bucket: '31–60 Days' },
    { belnr: '5100000005', gjahr: '2024', lifnr: '0000100001', bldat: '2024-04-01', faedt: '2024-05-01', dmbtr: 18500, waers: 'INR', aging_days: 92, aging_bucket: '>90 Days' },
  ],
  '0000100002': [
    { belnr: '5100000011', gjahr: '2024', lifnr: '0000100002', bldat: '2024-07-10', faedt: '2024-08-24', dmbtr: 42000, waers: 'INR', aging_days: 45, aging_bucket: '31–60 Days' },
  ],
};

module.exports = { vendors, rfqData, poData, grData, invoiceData, agingData };
