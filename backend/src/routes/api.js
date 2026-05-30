const express = require('express');
const router = express.Router();

// Middleware
const { protect, authorize } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const donorController = require('../controllers/donorController');
const hospitalController = require('../controllers/hospitalController');
const stockController = require('../controllers/stockController');
const analyticsController = require('../controllers/analyticsController');
const notificationController = require('../controllers/notificationController');

// --- AUTHENTICATION ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// --- DONOR PORTAL ROUTES ---
router.get('/donors', protect, authorize('admin'), donorController.getDonors);
router.post('/donors/donate', protect, authorize('admin'), donorController.createDonation);
router.get('/donors/history', protect, authorize('donor'), donorController.getDonationHistory);
router.post('/donors/appointment', protect, authorize('donor'), donorController.bookAppointment);
router.get('/donors/appointments', protect, donorController.getAppointments);

// --- HOSPITAL & REQUEST ROUTES ---
router.get('/hospitals', protect, authorize('admin'), hospitalController.getHospitals);
router.get('/requests', protect, hospitalController.getRequests);
router.post('/requests', protect, authorize('hospital'), hospitalController.createRequest);
router.put('/requests/:id/status', protect, authorize('admin'), hospitalController.updateRequestStatus);

// --- BLOOD STOCK & EMERGENCY ALERT ROUTES ---
router.get('/blood-stock', stockController.getStock);
router.get('/blood-stock/units', protect, authorize('admin'), stockController.getBloodUnits);
router.post('/blood-stock/sweep-expiry', protect, authorize('admin'), stockController.markExpiredUnits);
router.post('/blood-stock/alerts', protect, stockController.triggerAlert);
router.get('/blood-stock/alerts', stockController.getAlerts);

// --- DASHBOARD ANALYTICS ---
router.get('/analytics/dashboard', protect, authorize('admin'), analyticsController.getDashboardAnalytics);

// --- NOTIFICATIONS ---
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/:id', protect, notificationController.markRead);

module.exports = router;
