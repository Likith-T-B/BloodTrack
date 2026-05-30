const db = require('../config/db');

// @desc    Get inventory summary
// @route   GET /api/blood-stock
// @access  Public
exports.getStock = async (req, res) => {
  try {
    if (db.isMock()) {
      const stock = db.mockDb.readTable('blood_stock');
      // Append warning status
      const data = stock.map(item => ({
        ...item,
        stock_status: item.total_units === 0 
          ? 'OUT OF STOCK' 
          : item.total_units < item.min_required_units 
            ? 'CRITICAL STOCK' 
            : 'OPTIMAL STOCK'
      }));
      return res.status(200).json({ success: true, data });
    } else {
      // Query our advanced DBMS view!
      const rows = await db.query('SELECT * FROM available_blood_summary');
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Stock Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get detailed individual blood units (Admin only)
// @route   GET /api/blood-stock/units
// @access  Private/Admin
exports.getBloodUnits = async (req, res) => {
  try {
    if (db.isMock()) {
      const bloodUnits = db.mockDb.readTable('blood_units');
      return res.status(200).json({ success: true, data: bloodUnits });
    } else {
      const rows = await db.query('SELECT * FROM blood_units ORDER BY expiry_date ASC');
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Blood Units Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Sweep and mark expired blood units
// @route   POST /api/blood-stock/sweep-expiry
// @access  Private/Admin
exports.markExpiredUnits = async (req, res) => {
  try {
    if (db.isMock()) {
      const bloodUnits = db.mockDb.readTable('blood_units');
      const today = new Date();
      let expiredCount = 0;

      bloodUnits.forEach((unit, idx) => {
        if (unit.status === 'available' && new Date(unit.expiry_date) < today) {
          bloodUnits[idx].status = 'expired';
          expiredCount++;
        }
      });

      if (expiredCount > 0) {
        db.mockDb.writeTable('blood_units', bloodUnits);

        // Recalculate stock
        const stock = db.mockDb.readTable('blood_stock');
        stock.forEach((item, idx) => {
          const activeCount = bloodUnits.filter(
            bu => bu.blood_group === item.blood_group && 
                  bu.status === 'available' && 
                  new Date(bu.expiry_date) >= today
          ).length;
          stock[idx].total_units = activeCount;
          stock[idx].updated_at = new Date();
        });
        db.mockDb.writeTable('blood_stock', stock);
      }

      return res.status(200).json({ success: true, expiredCount, message: `Completed sweep. ${expiredCount} units marked expired.` });
    } else {
      // Call Stored Procedure
      await db.query('CALL MarkExpiredBloodUnits(@expired_count)');
      const rows = await db.query('SELECT @expired_count AS expiredCount');
      const expiredCount = rows[0].expiredCount || 0;

      return res.status(200).json({ success: true, expiredCount, message: `Completed sweep. ${expiredCount} units marked expired in MySQL.` });
    }
  } catch (error) {
    console.error('Sweep Expiry Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Submit / Trigger an Emergency Blood Alert (Admin or Hospital request fallback)
// @route   POST /api/blood-stock/alerts
// @access  Private
exports.triggerAlert = async (req, res) => {
  const { bloodGroup, unitsNeeded, city, hospitalName, message } = req.body;

  try {
    if (!bloodGroup || !unitsNeeded || !city || !hospitalName) {
      return res.status(400).json({ success: false, message: 'Please provide all details for emergency broadcast' });
    }

    if (db.isMock()) {
      const alerts = db.mockDb.readTable('emergency_alerts');
      const alertId = db.mockDb.getNextId('emergency_alerts');
      const newAlert = {
        id: alertId,
        blood_group: bloodGroup,
        units_needed: parseInt(unitsNeeded),
        city,
        hospital_name: hospitalName,
        message: message || `Emergency! ${unitsNeeded} units of ${bloodGroup} needed at ${hospitalName}, ${city}.`,
        is_active: 1,
        created_at: new Date()
      };
      alerts.push(newAlert);
      db.mockDb.writeTable('emergency_alerts', alerts);

      // Notify eligible donors of matching blood group in target city!
      // This implements our donor compatibility recommendation logic.
      const donors = db.mockDb.readTable('donors');
      const users = db.mockDb.readTable('users');
      const compatibility = db.mockDb.readTable('blood_compatibility');

      // Compatible donors match recipient
      const matchingGroups = compatibility
        .filter(c => c.recipient_group === bloodGroup)
        .map(c => c.donor_group);

      const eligibleDonors = donors.filter(d => {
        const u = users.find(user => user.id === d.user_id) || {};
        return matchingGroups.includes(d.blood_group) && 
               u.city && u.city.toLowerCase() === city.toLowerCase() &&
               d.is_eligible === 1;
      });

      const notifications = db.mockDb.readTable('notifications');
      eligibleDonors.forEach(donor => {
        notifications.push({
          id: db.mockDb.getNextId('notifications') + Math.random(),
          user_id: donor.user_id,
          title: '🚨 EMERGENCY BLOOD DONATION REQUIRED',
          message: `Dear Donor, ${hospitalName} in your city (${city}) urgently requires compatible blood (${bloodGroup}). As an eligible matching donor, please consider donating immediately!`,
          is_read: 0,
          created_at: new Date()
        });
      });
      db.mockDb.writeTable('notifications', notifications);

      return res.status(201).json({ 
        success: true, 
        alert: newAlert, 
        matchingDonorsCount: eligibleDonors.length,
        message: `Emergency broadcast initiated. ${eligibleDonors.length} matching donors in ${city} notified!` 
      });
    } else {
      // Real MySQL query
      const result = await db.query(
        `INSERT INTO emergency_alerts (blood_group, units_needed, city, hospital_name, message, is_active) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [bloodGroup, unitsNeeded, city, hospitalName, message || `Urgent need of ${bloodGroup} at ${hospitalName}`]
      );
      const alertId = result.insertId;

      // Find compatible groups and match users via MySQL Stored Procedure or directly
      // Call GetCompatibleDonors procedure to fetch the eligible donor matches and generate notifications!
      const eligibleDonors = await db.query('CALL GetCompatibleDonors(?, ?)', [bloodGroup, city]);
      const donorsList = eligibleDonors[0] || [];

      for (const donor of donorsList) {
        // Fetch user id from donor mapping
        const userRows = await db.query('SELECT user_id FROM donors WHERE id = ?', [donor.donor_id]);
        if (userRows.length > 0) {
          await db.query(
            `INSERT INTO notifications (user_id, title, message) 
             VALUES (?, '🚨 EMERGENCY BLOOD DONATION REQUIRED', ?)`,
            [
              userRows[0].user_id,
              `Dear Donor, ${hospitalName} in your city (${city}) urgently requires compatible blood (${bloodGroup}). You are an eligible compatible match. Please consider donating!`
            ]
          );
        }
      }

      return res.status(201).json({ 
        success: true, 
        matchingDonorsCount: donorsList.length,
        message: `Emergency broadcast initiated in MySQL. ${donorsList.length} matching donors in ${city} notified!`
      });
    }
  } catch (error) {
    console.error('Trigger Emergency Alert Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get active emergency alerts
// @route   GET /api/blood-stock/alerts
// @access  Public
exports.getAlerts = async (req, res) => {
  try {
    if (db.isMock()) {
      const alerts = db.mockDb.readTable('emergency_alerts');
      const activeAlerts = alerts.filter(a => a.is_active === 1);
      return res.status(200).json({ success: true, data: activeAlerts });
    } else {
      const rows = await db.query('SELECT * FROM emergency_alerts WHERE is_active = 1 ORDER BY created_at DESC');
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Alerts Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
