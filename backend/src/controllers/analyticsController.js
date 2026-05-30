const db = require('../config/db');

// @desc    Get dashboard analytics (Admin dashboard)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    if (db.isMock()) {
      const users = db.mockDb.readTable('users');
      const donors = db.mockDb.readTable('donors');
      const hospitals = db.mockDb.readTable('hospitals');
      const requests = db.mockDb.readTable('blood_requests');
      const bloodUnits = db.mockDb.readTable('blood_units');
      const stock = db.mockDb.readTable('blood_stock');
      const alerts = db.mockDb.readTable('emergency_alerts');

      const totalDonors = donors.length;
      const totalHospitals = hospitals.length;
      const totalAvailableUnits = bloodUnits.filter(bu => bu.status === 'available').length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const activeAlerts = alerts.filter(a => a.is_active === 1).length;

      // Group stock data by blood type for charts
      const stockSummary = stock.map(s => ({
        bloodGroup: s.blood_group,
        units: s.total_units || 0,
        minRequired: s.min_required_units || 10
      }));

      // Calculate simple demand trend (requests count by blood type)
      const demandTrends = stock.map(s => {
        const reqCount = requests.filter(r => r.blood_group === s.blood_group).length;
        return {
          bloodGroup: s.blood_group,
          requestsCount: reqCount
        };
      });

      // Recent activities
      const recentDonations = db.mockDb.readTable('donations')
        .slice(-5)
        .reverse()
        .map(d => {
          const donorObj = donors.find(donor => donor.id === d.donor_id) || {};
          const userObj = users.find(u => u.id === donorObj.user_id) || {};
          return {
            id: d.id,
            donorName: userObj.name || 'Anonymous Donor',
            bloodGroup: donorObj.blood_group || 'O+',
            donationDate: d.donation_date,
            units: d.units_donated
          };
        });

      const recentRequests = requests
        .slice(-5)
        .reverse()
        .map(r => {
          const hospObj = hospitals.find(h => h.id === r.hospital_id) || {};
          const userObj = users.find(u => u.id === hospObj.user_id) || {};
          return {
            id: r.id,
            hospitalName: userObj.name || 'Hospital Client',
            bloodGroup: r.blood_group,
            units: r.units_requested,
            priority: r.priority,
            status: r.status,
            createdAt: r.created_at
          };
        });

      return res.status(200).json({
        success: true,
        summary: {
          totalDonors,
          totalHospitals,
          totalAvailableUnits,
          pendingRequests,
          activeAlerts
        },
        stockSummary,
        demandTrends,
        recentDonations,
        recentRequests
      });
    } else {
      // Real MySQL aggregates
      const donorsCount = await db.query('SELECT COUNT(*) AS count FROM donors');
      const hospitalsCount = await db.query('SELECT COUNT(*) AS count FROM hospitals');
      const stockCount = await db.query('SELECT SUM(total_units) AS count FROM blood_stock');
      const pendingCount = await db.query('SELECT COUNT(*) AS count FROM blood_requests WHERE status = "pending"');
      const alertsCount = await db.query('SELECT COUNT(*) AS count FROM emergency_alerts WHERE is_active = 1');

      const stockSummary = await db.query(
        'SELECT blood_group AS bloodGroup, total_units AS units, min_required_units AS minRequired FROM blood_stock'
      );

      const demandTrends = await db.query(
        `SELECT bs.blood_group AS bloodGroup, COUNT(br.id) AS requestsCount 
         FROM blood_stock bs 
         LEFT JOIN blood_requests br ON bs.blood_group = br.blood_group 
         GROUP BY bs.blood_group`
      );

      const recentDonations = await db.query(
        `SELECT dn.id, u.name AS donorName, d.blood_group AS bloodGroup, dn.donation_date AS donationDate, dn.units_donated AS units
         FROM donations dn
         JOIN donors d ON dn.donor_id = d.id
         JOIN users u ON d.user_id = u.id
         ORDER BY dn.donation_date DESC LIMIT 5`
      );

      const recentRequests = await db.query(
        `SELECT r.id, u.name AS hospitalName, r.blood_group AS bloodGroup, r.units_requested AS units, r.priority, r.status, r.created_at AS createdAt
         FROM blood_requests r
         JOIN hospitals h ON r.hospital_id = h.id
         JOIN users u ON h.user_id = u.id
         ORDER BY r.created_at DESC LIMIT 5`
      );

      return res.status(200).json({
        success: true,
        summary: {
          totalDonors: donorsCount[0].count,
          totalHospitals: hospitalsCount[0].count,
          totalAvailableUnits: stockCount[0].count || 0,
          pendingRequests: pendingCount[0].count,
          activeAlerts: alertsCount[0].count
        },
        stockSummary,
        demandTrends,
        recentDonations,
        recentRequests
      });
    }
  } catch (error) {
    console.error('Analytics Fetching Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
