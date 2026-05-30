const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main Router Mount
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Blood Bank Management API is running',
    mode: db.isMock() ? 'Self-Contained JSON Mock Engine' : 'Production MySQL Server'
  });
});

// Seed default users if empty
const seedDefaultUsers = async () => {
  try {
    if (db.isMock()) {
      const users = db.mockDb.readTable('users');
      if (users.length === 0) {
        console.log('🌱 Seeding initial demo users for instant trial...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const donorHashed = await bcrypt.hash('donor123', salt);
        const hospHashed = await bcrypt.hash('hospital123', salt);

        // 1. Admin
        users.push({
          id: 1,
          name: 'Chief Admin Officer',
          email: 'admin@bloodbank.com',
          password: hashedPassword,
          role: 'admin',
          phone: '+1 800-555-0199',
          city: 'Chicago',
          address: 'Red Cross Boulevard, HQ',
          created_at: new Date()
        });

        // 2. Donor
        users.push({
          id: 2,
          name: 'John Doe (Donor)',
          email: 'donor@bloodbank.com',
          password: donorHashed,
          role: 'donor',
          phone: '+1 312-555-0144',
          city: 'Chicago',
          address: '455 Michigan Ave',
          created_at: new Date()
        });

        // 3. Hospital
        users.push({
          id: 3,
          name: 'St. Mary General Hospital',
          email: 'hospital@bloodbank.com',
          password: hospHashed,
          role: 'hospital',
          phone: '+1 312-555-0122',
          city: 'Chicago',
          address: '800 W Harrison St',
          created_at: new Date()
        });

        // 4. Hospital 2
        users.push({
          id: 4,
          name: 'Mercy Wellness Clinic',
          email: 'mercy@bloodtrack.com',
          password: hospHashed,
          role: 'hospital',
          phone: '+1 312-555-0820',
          city: 'Chicago',
          address: '412 N Michigan Ave',
          created_at: new Date()
        });

        // 5. Hospital 3
        users.push({
          id: 5,
          name: 'City Memorial Hospital',
          email: 'city@bloodtrack.com',
          password: hospHashed,
          role: 'hospital',
          phone: '+1 312-555-0777',
          city: 'Chicago',
          address: '550 S Dearborn St',
          created_at: new Date()
        });

        db.mockDb.writeTable('users', users);

        // Add Donor specific details
        const donors = db.mockDb.readTable('donors');
        donors.push({
          id: 1,
          user_id: 2,
          blood_group: 'O+',
          dob: '1992-06-15',
          gender: 'male',
          weight: 78.5,
          last_donation_date: '2026-03-10',
          is_eligible: 1,
          next_eligible_date: '2026-05-05',
          medical_conditions: 'None. Healthy blood count.'
        });
        db.mockDb.writeTable('donors', donors);

        // Add Hospital specific details
        const hospitals = db.mockDb.readTable('hospitals');
        hospitals.push({
          id: 1,
          user_id: 3,
          license_number: 'HOSP-IL-9882',
          emergency_contact: '+1 312-555-0911',
          hospital_type: 'private'
        });
        hospitals.push({
          id: 2,
          user_id: 4,
          license_number: 'HOSP-IL-7210',
          emergency_contact: '+1 312-555-0820',
          hospital_type: 'clinic'
        });
        hospitals.push({
          id: 3,
          user_id: 5,
          license_number: 'HOSP-IL-4431',
          emergency_contact: '+1 312-555-0777',
          hospital_type: 'government'
        });
        db.mockDb.writeTable('hospitals', hospitals);

        // Seed some starter donations
        const donations = db.mockDb.readTable('donations');
        donations.push({
          id: 1,
          donor_id: 1,
          donation_date: '2026-03-10',
          units_donated: 1,
          blood_pressure: '120/80',
          pulse_rate: 70,
          hemoglobin: 15.2,
          status: 'completed',
          notes: 'Standard successful donor intake'
        });
        db.mockDb.writeTable('donations', donations);

        // Seed some starter units
        const bloodUnits = db.mockDb.readTable('blood_units');
        bloodUnits.push({
          id: 1,
          blood_group: 'O+',
          donation_id: 1,
          collected_date: '2026-03-10',
          expiry_date: '2026-04-21',
          status: 'available',
          created_at: new Date()
        });
        // Add a few more mock inventory units
        const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        groups.forEach((g, idx) => {
          bloodUnits.push({
            id: idx + 2,
            blood_group: g,
            donation_id: null,
            collected_date: '2026-05-28',
            expiry_date: '2026-07-09',
            status: 'available',
            created_at: new Date()
          });
        });
        db.mockDb.writeTable('blood_units', bloodUnits);

        // Seed a pending request
        const requests = db.mockDb.readTable('blood_requests');
        requests.push({
          id: 1,
          hospital_id: 1,
          blood_group: 'A+',
          units_requested: 2,
          priority: 'emergency',
          required_before: '2026-06-05',
          status: 'pending',
          reason: 'Emergency operation requirement',
          created_at: new Date()
        });
        db.mockDb.writeTable('blood_requests', requests);

        console.log('✅ Demo accounts seeded successfully:');
        console.log('👉 Admin: admin@bloodbank.com / admin123');
        console.log('👉 Donor: donor@bloodbank.com / donor123');
        console.log('👉 Hospital 1: hospital@bloodbank.com / hospital123');
        console.log('👉 Hospital 2: mercy@bloodtrack.com / hospital123');
        console.log('👉 Hospital 3: city@bloodtrack.com / hospital123');
      }
    } else {
      // Seed for real MySQL
      const rows = await db.query('SELECT id FROM users LIMIT 1');
      if (rows.length === 0) {
        console.log('🌱 Seeding initial demo users to MySQL...');
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('admin123', salt);
        const donorHash = await bcrypt.hash('donor123', salt);
        const hospHash = await bcrypt.hash('hospital123', salt);
 
        const adminUser = await db.query(
          `INSERT INTO users (name, email, password, role, phone, city, address) 
           VALUES ('Chief Admin Officer', 'admin@bloodbank.com', ?, 'admin', '+1 800-555-0199', 'Chicago', 'Red Cross HQ')`,
          [adminHash]
        );
 
        const donorUser = await db.query(
          `INSERT INTO users (name, email, password, role, phone, city, address) 
           VALUES ('John Doe (Donor)', 'donor@bloodbank.com', ?, 'donor', '+1 312-555-0144', 'Chicago', '455 Michigan Ave')`,
          [donorHash]
        );
        const donorUserId = donorUser.insertId;
 
        const hospUser = await db.query(
          `INSERT INTO users (name, email, password, role, phone, city, address) 
           VALUES ('St. Mary General Hospital', 'hospital@bloodbank.com', ?, 'hospital', '+1 312-555-0122', 'Chicago', '800 W Harrison St')`,
          [hospHash]
        );
        const hospUserId = hospUser.insertId;

        const hospUser2 = await db.query(
          `INSERT INTO users (name, email, password, role, phone, city, address) 
           VALUES ('Mercy Wellness Clinic', 'mercy@bloodtrack.com', ?, 'hospital', '+1 312-555-0820', 'Chicago', '412 N Michigan Ave')`,
          [hospHash]
        );
        const hospUserId2 = hospUser2.insertId;

        const hospUser3 = await db.query(
          `INSERT INTO users (name, email, password, role, phone, city, address) 
           VALUES ('City Memorial Hospital', 'city@bloodtrack.com', ?, 'hospital', '+1 312-555-0777', 'Chicago', '550 S Dearborn St')`,
          [hospHash]
        );
        const hospUserId3 = hospUser3.insertId;
 
        // Donor details
        await db.query(
          `INSERT INTO donors (user_id, blood_group, dob, gender, weight, is_eligible) 
           VALUES (?, 'O+', '1992-06-15', 'male', 78.5, 1)`,
          [donorUserId]
        );
 
        // Hospital details
        await db.query(
          `INSERT INTO hospitals (user_id, license_number, emergency_contact, hospital_type) 
           VALUES (?, 'HOSP-IL-9882', '+1 312-555-0911', 'private')`,
          [hospUserId]
        );

        await db.query(
          `INSERT INTO hospitals (user_id, license_number, emergency_contact, hospital_type) 
           VALUES (?, 'HOSP-IL-7210', '+1 312-555-0820', 'clinic')`,
          [hospUserId2]
        );

        await db.query(
          `INSERT INTO hospitals (user_id, license_number, emergency_contact, hospital_type) 
           VALUES (?, 'HOSP-IL-4431', '+1 312-555-0777', 'government')`,
          [hospUserId3]
        );
 
        console.log('✅ Demo accounts seeded successfully in MySQL Database!');
      }
    }
  } catch (error) {
    console.error('Error seeding default users:', error.message);
  }
};
 
const PORT = process.env.PORT || 5000;
 
const startServer = async () => {
  await db.initDb();
  await seedDefaultUsers();
  app.listen(PORT, () => {
    console.log(`🚀 BloodTrack Backend running on port ${PORT}`);
  });
};
 
startServer();
