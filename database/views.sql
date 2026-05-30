-- ==========================================
-- Advanced DBMS Features: Views
-- ==========================================

USE smart_blood_bank;

-- 1. View: Available Blood Stock Summary
-- Lists total units, min required units, and alert status for each blood group.
CREATE OR REPLACE VIEW available_blood_summary AS
SELECT 
    blood_group,
    total_units,
    min_required_units,
    CASE 
        WHEN total_units = 0 THEN 'OUT OF STOCK'
        WHEN total_units < min_required_units THEN 'CRITICAL STOCK'
        ELSE 'OPTIMAL STOCK'
    END AS stock_status,
    updated_at
FROM blood_stock;

-- 2. View: Emergency Request Dashboard
-- Shows active, pending high-priority requests with hospital details.
CREATE OR REPLACE VIEW pending_requests_view AS
SELECT 
    r.id AS request_id,
    u.name AS hospital_name,
    h.emergency_contact,
    u.city,
    r.blood_group,
    r.units_requested,
    r.priority,
    r.required_before,
    r.created_at
FROM blood_requests r
JOIN hospitals h ON r.hospital_id = h.id
JOIN users u ON h.user_id = u.id
WHERE r.status = 'pending'
ORDER BY 
    CASE r.priority
        WHEN 'critical' THEN 1
        WHEN 'emergency' THEN 2
        WHEN 'normal' THEN 3
        ELSE 4
    END, 
    r.required_before ASC;

-- 3. View: Active Eligible Donors Summary
-- Filters active donors and displays user profile information.
CREATE OR REPLACE VIEW eligible_donors_view AS
SELECT 
    d.id AS donor_id,
    u.name AS donor_name,
    d.blood_group,
    d.gender,
    d.dob,
    FLOOR(DATEDIFF(CURDATE(), d.dob) / 365.25) AS age,
    d.weight,
    u.phone,
    u.city,
    d.last_donation_date,
    d.next_eligible_date
FROM donors d
JOIN users u ON d.user_id = u.id
WHERE d.is_eligible = 1
  AND (d.next_eligible_date IS NULL OR d.next_eligible_date <= CURDATE());

-- 4. View: Recent Donations and Medical Stats
-- Detailed list of completed donations with blood chemistry readings.
CREATE OR REPLACE VIEW recent_donations_view AS
SELECT 
    dn.id AS donation_id,
    u.name AS donor_name,
    d.blood_group,
    dn.donation_date,
    dn.units_donated,
    dn.blood_pressure,
    dn.pulse_rate,
    dn.hemoglobin,
    dn.status
FROM donations dn
JOIN donors d ON dn.donor_id = d.id
JOIN users u ON d.user_id = u.id
ORDER BY dn.donation_date DESC;
