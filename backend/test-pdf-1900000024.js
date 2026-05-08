const axios = require('axios');
axios.create({
  baseURL: 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZMM_VENDOR_PORTAL_PKG_RBT_SRV/',
  auth: { username: 'k902090', password: 'Kishore@250605' },
  headers: { 'Accept': '*/*' },
  responseType: 'arraybuffer'
}).get(`InvoicePDFSet(Lifnr='0000100000',Belnr='1900000024',Gjahr='2024')/$value`)
.then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Length:', res.data.length);
  if (res.data.length > 0) {
    require('fs').writeFileSync('postman_test.pdf', res.data);
    console.log('Saved to postman_test.pdf');
  }
})
.catch(err => {
  console.log('Error:', err.message);
});
