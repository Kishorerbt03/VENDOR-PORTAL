const axios = require('axios');
axios.create({
  baseURL: 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZMM_VENDOR_PORTAL_PKG_RBT_SRV/',
  auth: { username: 'k902090', password: 'Kishore@250605' },
  headers: { 'Accept': 'application/pdf' },
  responseType: 'arraybuffer'
}).get(`InvoicePDFSet(Lifnr='0000100000',Belnr='1900001234',Gjahr='2024')/$value`)
.then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Data type:', Buffer.isBuffer(res.data));
  console.log('Length:', res.data.length);
  console.log('byteLength:', res.data.byteLength);
})
.catch(err => {
  console.log('Error:', err.message);
  if (err.response) {
    console.log('Response Status:', err.response.status);
    console.log('Response Data:', err.response.data.toString('utf-8'));
  }
});
