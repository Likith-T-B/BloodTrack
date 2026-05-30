-- ==========================================
-- Advanced DBMS Features: Stored Procedures
-- ==========================================


DELIMITER //

-- 1. Procedure: Emergency Donor Matching
-- Find all eligible donors who have compatible blood groups and live in the specified city.
DROP PROCEDURE IF EXISTS GetCompatibleDonors//
CREATE PROCEDURE GetCompatibleDonors(
    IN p_recipient_blood_group VARCHAR(5),
    IN p_city VARCHAR(100)
)
BEGIN
    SELECT 
        d.id AS donor_id,
        u.name AS donor_name,
        d.blood_group,
        u.phone,
        u.email,
        u.city,
        d.last_donation_date,
        d.next_eligible_date
    FROM donors d
    JOIN users u ON d.user_id = u.id
    JOIN blood_compatibility c ON c.donor_group = d.blood_group
    WHERE c.recipient_group = p_recipient_blood_group
      AND (p_city IS NULL OR u.city = p_city)
      AND d.is_eligible = 1
      AND (d.next_eligible_date IS NULL OR d.next_eligible_date <= CURDATE())
    ORDER BY d.last_donation_date ASC;
END//

-- 2. Procedure: Check Blood Stock Availability and Request Auto-Approval
-- Takes a request ID, checks if the requested blood type has enough available units,
-- allocates the oldest units (FIFO), and marks the request as Approved.
DROP PROCEDURE IF EXISTS ProcessBloodRequest//
CREATE PROCEDURE ProcessBloodRequest(
    IN p_request_id INT,
    OUT p_success TINYINT(1),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_blood_group VARCHAR(5);
    DECLARE v_units_requested INT;
    DECLARE v_units_available INT;
    DECLARE v_hospital_id INT;
    
    -- Start Transaction
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = 0;
        SET p_message = 'Database transaction failed during processing.';
    END;
    
    START TRANSACTION;
    
    -- Get request details
    SELECT blood_group, units_requested, hospital_id INTO v_blood_group, v_units_requested, v_hospital_id
    FROM blood_requests 
    WHERE id = p_request_id AND status = 'pending';
    
    IF v_blood_group IS NULL THEN
        SET p_success = 0;
        SET p_message = 'Pending request not found.';
        ROLLBACK;
    ELSE
        -- Count available units of compatible blood groups (including compatibility lookup)
        -- For simplicity, let's check exact match units in our active inventory first
        SELECT COUNT(*) INTO v_units_available
        FROM blood_units
        WHERE blood_group = v_blood_group AND status = 'available' AND expiry_date > CURDATE();
        
        IF v_units_available >= v_units_requested THEN
            -- Update the request status to approved
            UPDATE blood_requests
            SET status = 'approved'
            WHERE id = p_request_id;
            
            -- Allocate the oldest blood units (FIFO)
            -- MySQL does not support UPDATE with LIMIT inside triggers or subqueries easily,
            -- but we can select the units and mark them reserved/used.
            UPDATE blood_units bu
            SET bu.status = 'used'
            WHERE bu.blood_group = v_blood_group 
              AND bu.status = 'available' 
              AND bu.expiry_date > CURDATE()
            ORDER BY bu.expiry_date ASC
            LIMIT v_units_requested;
            
            SET p_success = 1;
            SET p_message = 'Request approved. Inventory units allocated successfully.';
            COMMIT;
        ELSE
            -- Reject request or mark as pending
            SET p_success = 0;
            SET p_message = CONCAT('Insufficient stock. Only ', v_units_available, ' units of ', v_blood_group, ' are available.');
            ROLLBACK;
        END IF;
    END IF;
END//

-- 3. Procedure: Auto-Mark Expired Blood Units
-- Runs daily check on blood units and shifts them to 'expired'
DROP PROCEDURE IF EXISTS MarkExpiredBloodUnits//
CREATE PROCEDURE MarkExpiredBloodUnits(
    OUT p_expired_count INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_expired_count = 0;
    END;
    
    START TRANSACTION;
    
    -- Count units that are available but past their expiry date
    SELECT COUNT(*) INTO p_expired_count
    FROM blood_units
    WHERE status = 'available' AND expiry_date < CURDATE();
    
    IF p_expired_count > 0 THEN
        -- Shift them to expired status
        UPDATE blood_units
        SET status = 'expired'
        WHERE status = 'available' AND expiry_date < CURDATE();
        
        -- Update the main stock totals as well
        -- (Deducting expired units from summarized stock counts)
        -- We run a synchronization query to make sure total_units matches available count
        UPDATE blood_stock bs
        SET bs.total_units = (
            SELECT COUNT(*) 
            FROM blood_units bu 
            WHERE bu.blood_group = bs.blood_group 
              AND bu.status = 'available' 
              AND bu.expiry_date >= CURDATE()
        );
    END IF;
    
    COMMIT;
END//

DELIMITER ;
