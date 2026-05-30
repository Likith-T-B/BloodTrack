const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Master files list
const TABLES = {
  users: 'users.json',
  donors: 'donors.json',
  hospitals: 'hospitals.json',
  blood_stock: 'blood_stock.json',
  blood_units: 'blood_units.json',
  donations: 'donations.json',
  blood_requests: 'blood_requests.json',
  eligibility_checks: 'eligibility_checks.json',
  emergency_alerts: 'emergency_alerts.json',
  notifications: 'notifications.json',
  appointments: 'appointments.json',
  request_status_logs: 'request_status_logs.json',
  admin_logs: 'admin_logs.json',
  blood_compatibility: 'blood_compatibility.json'
};

// Initial mock data
const INITIAL_STOCK = [
  { blood_group: 'A+', total_units: 15, min_required_units: 10, updated_at: new Date() },
  { blood_group: 'A-', total_units: 5, min_required_units: 8, updated_at: new Date() },
  { blood_group: 'B+', total_units: 12, min_required_units: 10, updated_at: new Date() },
  { blood_group: 'B-', total_units: 4, min_required_units: 8, updated_at: new Date() },
  { blood_group: 'AB+', total_units: 8, min_required_units: 8, updated_at: new Date() },
  { blood_group: 'AB-', total_units: 2, min_required_units: 5, updated_at: new Date() },
  { blood_group: 'O+', total_units: 20, min_required_units: 12, updated_at: new Date() },
  { blood_group: 'O-', total_units: 3, min_required_units: 10, updated_at: new Date() }
];

const INITIAL_COMPATIBILITY = [
  { recipient_group: 'A+', donor_group: 'A+' }, { recipient_group: 'A+', donor_group: 'A-' }, { recipient_group: 'A+', donor_group: 'O+' }, { recipient_group: 'A+', donor_group: 'O-' },
  { recipient_group: 'A-', donor_group: 'A-' }, { recipient_group: 'A-', donor_group: 'O-' },
  { recipient_group: 'B+', donor_group: 'B+' }, { recipient_group: 'B+', donor_group: 'B-' }, { recipient_group: 'B+', donor_group: 'O+' }, { recipient_group: 'B+', donor_group: 'O-' },
  { recipient_group: 'B-', donor_group: 'B-' }, { recipient_group: 'B-', donor_group: 'O-' },
  { recipient_group: 'AB+', donor_group: 'A+' }, { recipient_group: 'AB+', donor_group: 'A-' }, { recipient_group: 'AB+', donor_group: 'B+' }, { recipient_group: 'AB+', donor_group: 'B-' }, { recipient_group: 'AB+', donor_group: 'AB+' }, { recipient_group: 'AB+', donor_group: 'AB-' }, { recipient_group: 'AB+', donor_group: 'O+' }, { recipient_group: 'AB+', donor_group: 'O-' },
  { recipient_group: 'AB-', donor_group: 'A-' }, { recipient_group: 'AB-', donor_group: 'B-' }, { recipient_group: 'AB-', donor_group: 'AB-' }, { recipient_group: 'AB-', donor_group: 'O-' },
  { recipient_group: 'O+', donor_group: 'O+' }, { recipient_group: 'O+', donor_group: 'O-' },
  { recipient_group: 'O-', donor_group: 'O-' }
];

function readTable(table) {
  const filePath = path.join(DATA_DIR, TABLES[table]);
  if (!fs.existsSync(filePath)) {
    if (table === 'blood_stock') {
      writeTable(table, INITIAL_STOCK);
      return INITIAL_STOCK;
    }
    if (table === 'blood_units') {
      const initialUnits = [];
      const stockCounts = { 'A+': 15, 'A-': 5, 'B+': 12, 'B-': 4, 'AB+': 8, 'AB-': 2, 'O+': 20, 'O-': 3 };
      let unitId = 1;
      for (const [bg, count] of Object.entries(stockCounts)) {
        for (let i = 0; i < count; i++) {
          const colDate = new Date();
          const expDate = new Date();
          expDate.setDate(colDate.getDate() + 40);
          initialUnits.push({
            id: unitId++,
            blood_group: bg,
            donation_id: null,
            collected_date: colDate.toISOString().split('T')[0],
            expiry_date: expDate.toISOString().split('T')[0],
            status: 'available',
            created_at: new Date()
          });
        }
      }
      writeTable(table, initialUnits);
      return initialUnits;
    }
    if (table === 'blood_compatibility') {
      writeTable(table, INITIAL_COMPATIBILITY);
      return INITIAL_COMPATIBILITY;
    }
    writeTable(table, []);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeTable(table, data) {
  const filePath = path.join(DATA_DIR, TABLES[table]);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Generate sequential IDs
function getNextId(table) {
  const rows = readTable(table);
  return rows.length > 0 ? Math.max(...rows.map(r => r.id || 0)) + 1 : 1;
}

module.exports = {
  readTable,
  writeTable,
  getNextId
};
