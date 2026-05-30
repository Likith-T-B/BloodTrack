const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const getJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretbloodbankjwttokenkey1234!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role, phone, city, address, details } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (db.isMock()) {
      const users = db.mockDb.readTable('users');
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const userId = db.mockDb.getNextId('users');
      const newUser = {
        id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        phone,
        city,
        address,
        created_at: new Date()
      };
      
      users.push(newUser);
      db.mockDb.writeTable('users', users);

      // Role specific tables
      if (role === 'donor') {
        const donors = db.mockDb.readTable('donors');
        const donorId = db.mockDb.getNextId('donors');
        const newDonor = {
          id: donorId,
          user_id: userId,
          blood_group: details.blood_group || 'O+',
          dob: details.dob || '1995-01-01',
          gender: details.gender || 'male',
          weight: details.weight || 70,
          last_donation_date: null,
          is_eligible: 1,
          next_eligible_date: null,
          medical_conditions: details.medical_conditions || ''
        };
        donors.push(newDonor);
        db.mockDb.writeTable('donors', donors);
      } else if (role === 'hospital') {
        const hospitals = db.mockDb.readTable('hospitals');
        const hospitalId = db.mockDb.getNextId('hospitals');
        const newHospital = {
          id: hospitalId,
          user_id: userId,
          license_number: details.license_number || `LIC-${Date.now()}`,
          emergency_contact: details.emergency_contact || phone,
          hospital_type: details.hospital_type || 'private'
        };
        hospitals.push(newHospital);
        db.mockDb.writeTable('hospitals', hospitals);
      }

      const token = getJWTToken(userId);
      return res.status(201).json({
        success: true,
        token,
        user: { id: userId, name, email, role, city }
      });
    } else {
      // Real MySQL query
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Start transaction or individual queries
      const resUser = await db.query(
        'INSERT INTO users (name, email, password, role, phone, city, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email.toLowerCase(), hashedPassword, role, phone, city, address]
      );
      const userId = resUser.insertId;

      if (role === 'donor') {
        await db.query(
          'INSERT INTO donors (user_id, blood_group, dob, gender, weight, medical_conditions) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, details.blood_group || 'O+', details.dob || '1995-01-01', details.gender || 'male', details.weight || 70, details.medical_conditions || '']
        );
      } else if (role === 'hospital') {
        await db.query(
          'INSERT INTO hospitals (user_id, license_number, emergency_contact, hospital_type) VALUES (?, ?, ?, ?)',
          [userId, details.license_number || `LIC-${Date.now()}`, details.emergency_contact || phone, details.hospital_type || 'private']
        );
      }

      const token = getJWTToken(userId);
      return res.status(201).json({
        success: true,
        token,
        user: { id: userId, name, email, role, city }
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (db.isMock()) {
      const users = db.mockDb.readTable('users');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = getJWTToken(user.id);
      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city }
      });
    } else {
      // Real MySQL login
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = getJWTToken(user.id);
      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city }
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (db.isMock()) {
      const users = db.mockDb.readTable('users');
      const user = users.find(u => String(u.id) === String(req.user.id));

      let profileDetails = {};
      if (user.role === 'donor') {
        const donors = db.mockDb.readTable('donors');
        profileDetails = donors.find(d => String(d.user_id) === String(user.id)) || {};
      } else if (user.role === 'hospital') {
        const hospitals = db.mockDb.readTable('hospitals');
        profileDetails = hospitals.find(h => String(h.user_id) === String(user.id)) || {};
      }

      return res.status(200).json({
        success: true,
        user: { ...user, password: '', details: profileDetails }
      });
    } else {
      const rows = await db.query('SELECT id, name, email, role, phone, city, address, created_at FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const user = rows[0];

      let details = {};
      if (user.role === 'donor') {
        const donorRows = await db.query('SELECT * FROM donors WHERE user_id = ?', [user.id]);
        details = donorRows[0] || {};
      } else if (user.role === 'hospital') {
        const hospitalRows = await db.query('SELECT * FROM hospitals WHERE user_id = ?', [user.id]);
        details = hospitalRows[0] || {};
      }

      return res.status(200).json({
        success: true,
        user: { ...user, details }
      });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
