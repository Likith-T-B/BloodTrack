const db = require('../config/db');

// @desc    Get all donors (Admin only)
// @route   GET /api/donors
// @access  Private/Admin
exports.getDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const users = db.mockDb.readTable('users');
      
      let results = donors.map(d => {
        const u = users.find(user => user.id === d.user_id) || {};
        return {
          id: d.id,
          user_id: d.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          city: u.city,
          address: u.address,
          blood_group: d.blood_group,
          dob: d.dob,
          gender: d.gender,
          weight: d.weight,
          last_donation_date: d.last_donation_date,
          is_eligible: d.is_eligible,
          next_eligible_date: d.next_eligible_date,
          medical_conditions: d.medical_conditions
        };
      });

      if (bloodGroup) {
        results = results.filter(d => d.blood_group === bloodGroup);
      }
      if (city) {
        results = results.filter(d => d.city && d.city.toLowerCase().includes(city.toLowerCase()));
      }

      return res.status(200).json({ success: true, data: results });
    } else {
      let queryStr = `
        SELECT 
          d.id, d.user_id, u.name, u.email, u.phone, u.city, u.address,
          d.blood_group, d.dob, d.gender, d.weight, d.last_donation_date,
          d.is_eligible, d.next_eligible_date, d.medical_conditions
        FROM donors d
        JOIN users u ON d.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (bloodGroup) {
        queryStr += ' AND d.blood_group = ?';
        params.push(bloodGroup);
      }
      if (city) {
        queryStr += ' AND u.city LIKE ?';
        params.push(`%${city}%`);
      }

      const rows = await db.query(queryStr, params);
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Donors Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Record a blood donation (Admin records a donation)
// @route   POST /api/donors/donate
// @access  Private/Admin
exports.createDonation = async (req, res) => {
  const { donorId, donationDate, unitsDonated, bloodPressure, pulseRate, hemoglobin, notes } = req.body;

  try {
    if (!donorId || !donationDate) {
      return res.status(400).json({ success: false, message: 'Donor ID and Donation Date are required' });
    }

    const units = parseInt(unitsDonated) || 1;

    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const donorIndex = donors.findIndex(d => d.id === parseInt(donorId));

      if (donorIndex === -1) {
        return res.status(404).json({ success: false, message: 'Donor not found' });
      }

      const donor = donors[donorIndex];

      // Simulated Trigger: Update stock level, update donor, add detailed unit
      const donations = db.mockDb.readTable('donations');
      const donationId = db.mockDb.getNextId('donations');
      const newDonation = {
        id: donationId,
        donor_id: parseInt(donorId),
        donation_date: donationDate,
        units_donated: units,
        blood_pressure: bloodPressure || '120/80',
        pulse_rate: parseInt(pulseRate) || 72,
        hemoglobin: parseFloat(hemoglobin) || 14.5,
        status: 'completed',
        notes
      };
      donations.push(newDonation);
      db.mockDb.writeTable('donations', donations);

      // Increment Blood Stock Summary
      const stock = db.mockDb.readTable('blood_stock');
      const stockItem = stock.find(s => s.blood_group === donor.blood_group);
      if (stockItem) {
        stockItem.total_units = (stockItem.total_units || 0) + units;
        stockItem.updated_at = new Date();
        db.mockDb.writeTable('blood_stock', stock);
      }

      // Add a detailed Blood Unit
      const bloodUnits = db.mockDb.readTable('blood_units');
      const expiry = new Date(donationDate);
      expiry.setDate(expiry.getDate() + 42); // 42 days shelf life

      for (let i = 0; i < units; i++) {
        bloodUnits.push({
          id: db.mockDb.getNextId('blood_units') + i,
          blood_group: donor.blood_group,
          donation_id: donationId,
          collected_date: donationDate,
          expiry_date: expiry.toISOString().split('T')[0],
          status: 'available',
          created_at: new Date()
        });
      }
      db.mockDb.writeTable('blood_units', bloodUnits);

      // Update Donor cooldown (is_eligible = 0, cooldown 56 days)
      const nextEligible = new Date(donationDate);
      nextEligible.setDate(nextEligible.getDate() + 56);

      donor.last_donation_date = donationDate;
      donor.is_eligible = 0;
      donor.next_eligible_date = nextEligible.toISOString().split('T')[0];
      donors[donorIndex] = donor;
      db.mockDb.writeTable('donors', donors);

      return res.status(201).json({ success: true, message: 'Donation recorded and stock updated (Simulated Trigger executed).' });
    } else {
      // Real MySQL query -> trigger `after_donation_insert` will fire!
      await db.query(
        `INSERT INTO donations (donor_id, donation_date, units_donated, blood_pressure, pulse_rate, hemoglobin, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [donorId, donationDate, units, bloodPressure || '120/80', pulseRate || 72, hemoglobin || 14.5, notes || '']
      );

      return res.status(201).json({ success: true, message: 'Donation recorded successfully. MySQL trigger automatically updated stock levels!' });
    }
  } catch (error) {
    console.error('Record Donation Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get donor's own donation history
// @route   GET /api/donors/history
// @access  Private (Donor only)
exports.getDonationHistory = async (req, res) => {
  try {
    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const donor = donors.find(d => d.user_id === req.user.id);
      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const donations = db.mockDb.readTable('donations');
      const results = donations.filter(d => d.donor_id === donor.id);
      return res.status(200).json({ success: true, data: results });
    } else {
      const donorRows = await db.query('SELECT id FROM donors WHERE user_id = ?', [req.user.id]);
      if (donorRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }
      const donorId = donorRows[0].id;

      const rows = await db.query('SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC', [donorId]);
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Donation History Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Book donation appointment
// @route   POST /api/donors/appointment
// @access  Private (Donor only)
exports.bookAppointment = async (req, res) => {
  const { appointmentDate, appointmentTime } = req.body;

  try {
    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Date and time are required' });
    }

    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const donor = donors.find(d => d.user_id === req.user.id);
      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const appointments = db.mockDb.readTable('appointments');
      const id = db.mockDb.getNextId('appointments');
      const newAppointment = {
        id,
        donor_id: donor.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        status: 'scheduled',
        created_at: new Date()
      };
      appointments.push(newAppointment);
      db.mockDb.writeTable('appointments', appointments);

      return res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment: newAppointment });
    } else {
      const donorRows = await db.query('SELECT id FROM donors WHERE user_id = ?', [req.user.id]);
      if (donorRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }
      const donorId = donorRows[0].id;

      await db.query(
        'INSERT INTO appointments (donor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, "scheduled")',
        [donorId, appointmentDate, appointmentTime]
      );

      return res.status(201).json({ success: true, message: 'Appointment booked successfully' });
    }
  } catch (error) {
    console.error('Book Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get donor appointments (Admin can get all, Donor gets their own)
// @route   GET /api/donors/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    if (db.isMock()) {
      const appointments = db.mockDb.readTable('appointments');
      const donors = db.mockDb.readTable('donors');
      const users = db.mockDb.readTable('users');

      let results = appointments.map(app => {
        const d = donors.find(donor => donor.id === app.donor_id) || {};
        const u = users.find(user => user.id === d.user_id) || {};
        return {
          id: app.id,
          donor_id: app.donor_id,
          donor_name: u.name,
          blood_group: d.blood_group,
          phone: u.phone,
          appointment_date: app.appointment_date,
          appointment_time: app.appointment_time,
          status: app.status
        };
      });

      if (req.user.role === 'donor') {
        const donor = donors.find(d => d.user_id === req.user.id);
        if (donor) {
          results = results.filter(app => app.donor_id === donor.id);
        }
      }

      return res.status(200).json({ success: true, data: results });
    } else {
      let rows;
      if (req.user.role === 'donor') {
        const donorRows = await db.query('SELECT id FROM donors WHERE user_id = ?', [req.user.id]);
        if (donorRows.length === 0) {
          return res.status(200).json({ success: true, data: [] });
        }
        const donorId = donorRows[0].id;
        rows = await db.query(
          `SELECT a.id, a.donor_id, a.appointment_date, a.appointment_time, a.status 
           FROM appointments a WHERE a.donor_id = ? ORDER BY a.appointment_date DESC`,
          [donorId]
        );
      } else {
        // Admin
        rows = await db.query(
          `SELECT a.id, a.donor_id, u.name AS donor_name, d.blood_group, u.phone, a.appointment_date, a.appointment_time, a.status
           FROM appointments a
           JOIN donors d ON a.donor_id = d.id
           JOIN users u ON d.user_id = u.id
           ORDER BY a.appointment_date DESC`
        );
      }
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Save donor eligibility check
// @route   POST /api/donors/eligibility
// @access  Private (Donor only)
exports.saveEligibilityCheck = async (req, res) => {
  const { weight, age, isEligible, reason } = req.body;

  try {
    if (weight === undefined || age === undefined || isEligible === undefined) {
      return res.status(400).json({ success: false, message: 'Weight, age, and eligibility status are required' });
    }

    const checkDate = new Date().toISOString().split('T')[0];

    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const donorIndex = donors.findIndex(d => d.user_id === req.user.id);
      if (donorIndex === -1) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const donor = donors[donorIndex];
      const eligibilityChecks = db.mockDb.readTable('eligibility_checks') || [];
      const id = db.mockDb.getNextId('eligibility_checks');

      const newCheck = {
        id,
        donor_id: donor.id,
        check_date: checkDate,
        is_eligible: isEligible ? 1 : 0,
        reason: reason || '',
        weight_kg: parseFloat(weight),
        age: parseInt(age)
      };

      eligibilityChecks.push(newCheck);
      db.mockDb.writeTable('eligibility_checks', eligibilityChecks);

      // Update donor eligibility
      donor.is_eligible = isEligible ? 1 : 0;
      donor.next_eligible_date = isEligible ? null : new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      donors[donorIndex] = donor;
      db.mockDb.writeTable('donors', donors);

      return res.status(201).json({ success: true, message: 'Eligibility check logged successfully', data: newCheck });
    } else {
      const donorRows = await db.query('SELECT id FROM donors WHERE user_id = ?', [req.user.id]);
      if (donorRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }
      const donorId = donorRows[0].id;

      await db.query(
        'INSERT INTO eligibility_checks (donor_id, check_date, is_eligible, reason, weight_kg, age) VALUES (?, CURDATE(), ?, ?, ?, ?)',
        [donorId, isEligible ? 1 : 0, reason || '', weight, age]
      );

      // Update donor eligibility
      const nextEligibleDate = isEligible ? null : new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await db.query(
        'UPDATE donors SET is_eligible = ?, next_eligible_date = ? WHERE id = ?',
        [isEligible ? 1 : 0, nextEligibleDate, donorId]
      );

      return res.status(201).json({ success: true, message: 'Eligibility check logged successfully' });
    }
  } catch (error) {
    console.error('Save Eligibility Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get donor eligibility checks history
// @route   GET /api/donors/eligibility
// @access  Private (Donor only)
exports.getEligibilityHistory = async (req, res) => {
  try {
    if (db.isMock()) {
      const donors = db.mockDb.readTable('donors');
      const donor = donors.find(d => d.user_id === req.user.id);
      if (!donor) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }

      const checks = db.mockDb.readTable('eligibility_checks') || [];
      const results = checks.filter(c => c.donor_id === donor.id).sort((a, b) => b.id - a.id);
      return res.status(200).json({ success: true, data: results });
    } else {
      const donorRows = await db.query('SELECT id FROM donors WHERE user_id = ?', [req.user.id]);
      if (donorRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Donor profile not found' });
      }
      const donorId = donorRows[0].id;

      const rows = await db.query(
        'SELECT * FROM eligibility_checks WHERE donor_id = ? ORDER BY check_date DESC, id DESC',
        [donorId]
      );
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Eligibility History Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
