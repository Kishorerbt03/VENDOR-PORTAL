export interface VendorProfile {
  vendor_id: string;
  name: string;
  street: string;
  city: string;
  country: string;
  postal_code: string;
  telephone: string;
  email: string;
  currency: string;
  payment_terms: string;
  company_code: string;
  tax_id: string;
  bank_account: string;
  category: string;
  rating: number;
}

export interface RFQ {
  rfq_no: string;
  bsart: string;
  item_name?: string;
  rfq_date: string;
  purchasing_org: string;
  quantity?: number;
  unit?: string;
  status: string;
}

export interface PurchaseOrder {
  po_no: string;
  bsart: string;
  item_name?: string;
  po_date: string;
  net_value: number;
  quantity?: number;
  unit?: string;
  status: string;
  currency: string;
}

export interface GoodsReceipt {
  gr_no: string;
  gr_year: string;
  item_name?: string;
  material: string;
  gr_date: string;
  quantity: number;
  uom: string;
}

export interface Invoice {
  belnr: string;
  gjahr: string;
  bldat: string;
  budat: string;
  faedt: string;
  lifnr: string;
  blart: string;
  dmbtr: number;
  waers: string;
  mwskz: string;
  xblnr: string;
  sgtxt: string;
  ebeln: string;
  status: 'Open' | 'Cleared';
  aging_days: number;
  aging_bucket: string;
}

export interface AgingRow {
  belnr: string;
  gjahr: string;
  lifnr: string;
  bldat: string;
  faedt: string;
  dmbtr: number;
  waers: string;
  aging_days: number;
  aging_bucket: string;
}

export interface DashboardStats {
  openRFQ: number;
  totalRFQ: number;
  openPO: number;
  totalPO: number;
  totalGR: number;
  poValue: number;
  totalInvoices: number;
  openPayable: number;
  poTrend: { label: string; value: number }[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  vendor: { vendor_id: string; name: string; email: string; currency: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  summary?: Record<string, number>;
}

export interface InvoicePdfResponse {
  success: boolean;
  belnr: string;
  ev_pdf: string;
}
