const db = require('../config/db');

// @desc    Get all hospitals (Admin only)
// @route   GET /api/hospitals
// @access  Private/Admin
exports.getHospitals = async (req, res) => {
  try {
    if (db.isMock()) {
      const hospitals = db.mockDb.readTable('hospitals');
      const users = db.mockDb.readTable('users');
      const data = hospitals.map(h => {
        const u = users.find(user => user.id === h.user_id) || {};
        return {
          id: h.id,
          user_id: h.user_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          city: u.city,
          address: u.address,
          license_number: h.license_number,
          emergency_contact: h.emergency_contact,
          hospital_type: h.hospital_type
        };
      });
      return res.status(200).json({ success: true, data });
    } else {
      const rows = await db.query(
        `SELECT h.id, h.user_id, u.name, u.email, u.phone, u.city, u.address, h.license_number, h.emergency_contact, h.hospital_type 
         FROM hospitals h JOIN users u ON h.user_id = u.id`
      );
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Hospitals Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all blood requests (Admin/Hospital specific)
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    if (db.isMock()) {
      const requests = db.mockDb.readTable('blood_requests');
      const hospitals = db.mockDb.readTable('hospitals');
      const users = db.mockDb.readTable('users');

      let results = requests.map(reqs => {
        const hosp = hospitals.find(h => h.id === reqs.hospital_id) || {};
        const u = users.find(user => user.id === hosp.user_id) || {};
        return {
          id: reqs.id,
          hospital_id: reqs.hospital_id,
          hospital_name: u.name,
          city: u.city,
          blood_group: reqs.blood_group,
          units_requested: reqs.units_requested,
          priority: reqs.priority,
          required_before: reqs.required_before,
          status: reqs.status,
          reason: reqs.reason,
          created_at: reqs.created_at
        };
      });

      if (req.user.role === 'hospital') {
        const hospital = hospitals.find(h => h.user_id === req.user.id);
        if (hospital) {
          results = results.filter(r => r.hospital_id === hospital.id);
        }
      }

      return res.status(200).json({ success: true, data: results });
    } else {
      let rows;
      if (req.user.role === 'hospital') {
        const hospitalRows = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
        if (hospitalRows.length === 0) {
          return res.status(200).json({ success: true, data: [] });
        }
        const hospitalId = hospitalRows[0].id;
        rows = await db.query(
          `SELECT r.id, r.blood_group, r.units_requested, r.priority, r.required_before, r.status, r.reason, r.created_at 
           FROM blood_requests r WHERE r.hospital_id = ? ORDER BY r.created_at DESC`,
          [hospitalId]
        );
      } else {
        // Admin
        rows = await db.query(
          `SELECT r.id, r.hospital_id, u.name AS hospital_name, u.city, r.blood_group, r.units_requested, r.priority, r.required_before, r.status, r.reason, r.created_at
           FROM blood_requests r
           JOIN hospitals h ON r.hospital_id = h.id
           JOIN users u ON h.user_id = u.id
           ORDER BY 
             CASE r.priority
               WHEN 'critical' THEN 1
               WHEN 'emergency' THEN 2
               WHEN 'normal' THEN 3
               ELSE 4
             END, r.created_at DESC`
        );
      }
      return res.status(200).json({ success: true, data: rows });
    }
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Submit blood request
// @route   POST /api/requests
// @access  Private/Hospital
exports.createRequest = async (req, res) => {
  const { bloodGroup, unitsRequested, priority, requiredBefore, reason } = req.body;

  try {
    if (!bloodGroup || !unitsRequested || !requiredBefore) {
      return res.status(400).json({ success: false, message: 'Blood Group, Units, and Due Date are required' });
    }

    if (db.isMock()) {
      const hospitals = db.mockDb.readTable('hospitals');
      const hospital = hospitals.find(h => h.user_id === req.user.id);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found' });
      }

      const requests = db.mockDb.readTable('blood_requests');
      const id = db.mockDb.getNextId('blood_requests');
      const newRequest = {
        id,
        hospital_id: hospital.id,
        blood_group: bloodGroup,
        units_requested: parseInt(unitsRequested),
        priority: priority || 'normal',
        required_before: requiredBefore,
        status: 'pending',
        reason,
        created_at: new Date()
      };
      requests.push(newRequest);
      db.mockDb.writeTable('blood_requests', requests);

      return res.status(201).json({ success: true, data: newRequest, message: 'Blood request submitted successfully' });
    } else {
      const hospitalRows = await db.query('SELECT id FROM hospitals WHERE user_id = ?', [req.user.id]);
      if (hospitalRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Hospital profile not found' });
      }
      const hospitalId = hospitalRows[0].id;

      await db.query(
        `INSERT INTO blood_requests (hospital_id, blood_group, units_requested, priority, required_before, status, reason) 
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [hospitalId, bloodGroup, unitsRequested, priority || 'normal', requiredBefore, reason || '']
      );

      return res.status(201).json({ success: true, message: 'Blood request submitted successfully' });
    }
  } catch (error) {
    console.error('Submit Request Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Process/Approve/Reject blood request (Admin only)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
  const { status, reason } = req.body;
  const requestId = parseInt(req.params.id);

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected.' });
    }

    if (db.isMock()) {
      const requests = db.mockDb.readTable('blood_requests');
      const reqIndex = requests.findIndex(r => r.id === requestId);

      if (reqIndex === -1) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      const request = requests[reqIndex];
      if (request.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Request has already been processed' });
      }

      const oldStatus = request.status;

      if (status === 'approved') {
        // Check availability
        const bloodUnits = db.mockDb.readTable('blood_units');
        const availableUnits = bloodUnits.filter(
          bu => bu.blood_group === request.blood_group && 
                bu.status === 'available' && 
                new Date(bu.expiry_date) > new Date()
        );

        if (availableUnits.length < request.units_requested) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock. Only ${availableUnits.length} available units of ${request.blood_group} exist, but ${request.units_requested} were requested.` 
          });
        }

        // FIFO: Deduct units (sort by expiry date ascending, oldest first)
        availableUnits.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        
        const unitsToMark = availableUnits.slice(0, request.units_requested);
        unitsToMark.forEach(unit => {
          const uIdx = bloodUnits.findIndex(bu => bu.id === unit.id);
          if (uIdx !== -1) {
            bloodUnits[uIdx].status = 'used';
          }
        });
        db.mockDb.writeTable('blood_units', bloodUnits);

        // Deduct from Blood Stock Summary
        const stock = db.mockDb.readTable('blood_stock');
        const stockItem = stock.find(s => s.blood_group === request.blood_group);
        if (stockItem) {
          stockItem.total_units = Math.max(0, stockItem.total_units - request.units_requested);
          stockItem.updated_at = new Date();
          db.mockDb.writeTable('blood_stock', stock);
        }
      }

      // Update Request status
      request.status = status;
      request.reason = reason || request.reason;
      requests[reqIndex] = request;
      db.mockDb.writeTable('blood_requests', requests);

      // Audit Logs & Notifications simulation
      const logs = db.mockDb.readTable('request_status_logs');
      logs.push({
        id: db.mockDb.getNextId('request_status_logs'),
        request_id: requestId,
        previous_status: oldStatus,
        new_status: status,
        changed_by: req.user.id,
        changed_at: new Date(),
        notes: reason || `Admin ${req.user.name} set status to ${status}`
      });
      db.mockDb.writeTable('request_status_logs', logs);

      // Send notification to hospital user
      const hospitals = db.mockDb.readTable('hospitals');
      const hosp = hospitals.find(h => h.id === request.hospital_id);
      if (hosp) {
        const notifications = db.mockDb.readTable('notifications');
        notifications.push({
          id: db.mockDb.getNextId('notifications'),
          user_id: hosp.user_id,
          title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
          message: status === 'approved' 
            ? `Your request for ${request.units_requested} units of ${request.blood_group} has been approved.` 
            : `Your request for ${request.units_requested} units of ${request.blood_group} was rejected. Reason: ${reason || 'None provided'}`,
          is_read: 0,
          created_at: new Date()
        });
        db.mockDb.writeTable('notifications', notifications);
      }

      return res.status(200).json({ success: true, message: `Request successfully ${status} and stock updated.` });
    } else {
      // Real MySQL transaction -> trigger `after_request_status_update` fires
      // We call the stored procedure `ProcessBloodRequest` if status = approved for advanced transactional security!
      if (status === 'approved') {
        const procResult = await db.query('CALL ProcessBloodRequest(?, @success, @message)', [requestId]);
        const details = await db.query('SELECT @success AS success, @message AS message');
        const success = details[0].success;
        const msg = details[0].message;

        if (success === 0 || !success) {
          return res.status(400).json({ success: false, message: msg || 'Stock processing failed.' });
        }
      } else {
        // Rejected
        await db.query(
          'UPDATE blood_requests SET status = "rejected", reason = ? WHERE id = ?',
          [reason || 'Rejected by administrator', requestId]
        );
      }

      return res.status(200).json({ success: true, message: `Request processed as ${status} successfully.` });
    }
  } catch (error) {
    console.error('Process Request Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
