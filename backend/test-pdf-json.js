const axios = require('axios');
axios.create({
  baseURL: 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZMM_VENDOR_PORTAL_PKG_RBT_SRV/',
  auth: { username: 'k902090', password: 'Kishore@250605' },
  headers: { 'Accept': 'application/json' },
  responseType: 'json'
}).get(`InvoicePDFSet(Lifnr='0000100000',Belnr='5000000000',Gjahr='2025')`)
.then(res => {
  console.log('Status:', res.status);
  console.log('Data:', res.data);
})
.catch(err => {
  console.log('Error:', err.message);
  if (err.response) {
    console.log('Response Status:', err.response.status);
    console.log('Response Data:', err.response.data);
  }
});
