-- ==========================================
-- Advanced DBMS Features: Triggers
-- ==========================================

USE smart_blood_bank;

DELIMITER //

-- 1. Trigger: Auto Update Stock on New Donation
-- When a donation is marked completed, automatically increment total units in blood_stock
-- and add a new row in blood_units with an expiry date of 42 days from collection.
DROP TRIGGER IF EXISTS after_donation_insert//
CREATE TRIGGER after_donation_insert
AFTER INSERT ON donations
FOR EACH ROW
BEGIN
    DECLARE v_blood_group VARCHAR(10);
    
    IF NEW.status = 'completed' THEN
        -- Find blood group of the donor
        SELECT blood_group INTO v_blood_group FROM donors WHERE id = NEW.donor_id;
        
        -- Increment the stock summary
        UPDATE blood_stock 
        SET total_units = total_units + NEW.units_donated
        WHERE blood_group = v_blood_group;
        
        -- Insert a detailed blood unit
        INSERT INTO blood_units (blood_group, donation_id, collected_date, expiry_date, status)
        VALUES (v_blood_group, NEW.id, NEW.donation_date, DATE_ADD(NEW.donation_date, INTERVAL 42 DAY), 'available');
        
        -- Update the donor's last donation date and set eligibility cooldown (56 days)
        UPDATE donors 
        SET last_donation_date = NEW.donation_date,
            is_eligible = 0,
            next_eligible_date = DATE_ADD(NEW.donation_date, INTERVAL 56 DAY)
        WHERE id = NEW.donor_id;
    END IF;
END//

-- 2. Trigger: Auto Update Stock on Request Status Change
-- When a hospital request status is changed to 'approved', automatically deduct the units from blood_stock
-- and log the transition in request_status_logs.
DROP TRIGGER IF EXISTS after_request_status_update//
CREATE TRIGGER after_request_status_update
AFTER UPDATE ON blood_requests
FOR EACH ROW
BEGIN
    -- Log the transition
    IF OLD.status <> NEW.status THEN
        INSERT INTO request_status_logs (request_id, previous_status, new_status, notes)
        VALUES (NEW.id, OLD.status, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
    END IF;

    -- If approved, deduct from blood stock and mark units as used
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        -- Deduct total units in stock summary
        UPDATE blood_stock
        SET total_units = GREATEST(0, total_units - NEW.units_requested)
        WHERE blood_group = NEW.blood_group;
        
        -- Create a notification for the hospital
        INSERT INTO notifications (user_id, title, message)
        SELECT h.user_id, 'Blood Request Approved', CONCAT('Your request for ', NEW.units_requested, ' units of ', NEW.blood_group, ' has been approved.')
        FROM hospitals h WHERE h.id = NEW.hospital_id;
    END IF;
    
    -- If rejected, notify the hospital
    IF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        INSERT INTO notifications (user_id, title, message)
        SELECT h.user_id, 'Blood Request Rejected', CONCAT('Your request for ', NEW.units_requested, ' units of ', NEW.blood_group, ' was not approved. Reason: ', COALESCE(NEW.reason, 'Not specified'))
        FROM hospitals h WHERE h.id = NEW.hospital_id;
    END IF;
END//

-- 3. Trigger: Auto Audit Log on Admin Actions (Admin Logs)
-- Keep track of any new user registrations or account modifications in administrative logs.
DROP TRIGGER IF EXISTS after_user_insert//
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        -- Log that a new admin is registered
        INSERT INTO admin_logs (admin_id, action, target_table, target_id)
        VALUES (NEW.id, 'Register Admin Account', 'users', NEW.id);
    END IF;
END//

DELIMITER ;
