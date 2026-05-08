const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const vendorController = require('../controllers/vendor.controller');
const financialController = require('../controllers/financial.controller');

// OData Routes as specified by user
router.get('/login', authController.login); // GET /api/login?vendorId=&password=
router.get('/profile/:vendorId', vendorController.getProfile);
router.get('/po/:vendorId', vendorController.getPO);
router.get('/gr/:vendorId', vendorController.getGR);
router.get('/rfq/:vendorId', vendorController.getRFQ);
router.get('/finance/:vendorId', financialController.getInvoices);
router.get('/aging/:vendorId', financialController.getAging);
router.get('/memo/:vendorId', financialController.getMemos);
router.get('/invoice/:belnr', financialController.getInvoicePDF);

router.get('/dashboard/:vendorId', vendorController.getDashboardStats);

module.exports = router;
