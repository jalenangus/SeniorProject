/*
================================================================================
|   Aggie One Access - APPLICATION LAYER (Backend Server)
|
|   VERSION 2 - This version includes ALL endpoints from your api.ts file.
|
================================================================================
*/
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 3001;

// === Middleware ===
app.use(cors());
app.use(express.json());

// === MySQL Database Connection (Data Layer) ===
const dbConfig = {
    host: 'localhost',
    user: 'root', // <-- Make sure this is your MySQL username
    password: 'jalen826', // <-- Make sure this is your MySQL password
    database: 'ncat_studyroom'
};

const pool = mysql.createPool(dbConfig);
console.log('Connecting to MySQL database...');

/*
================================================================================
|   API ENDPOINTS (Mapped to your ADS/DDS Subsystems)
================================================================================
*/

/**
 * Subsystem 5.4: Authentication Service
 */
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for: ${email}`);

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT f.id, f.fname, f.lname, f.email, r.role_name, r.can_request 
             FROM faculty f 
             JOIN roles r ON f.role_id = r.id 
             WHERE f.email = ?`,
            [email]
        );
        connection.release();

        if (rows.length === 0) {
            console.log(`[AUTH] Failed: User ${email} not found.`);
            return res.status(401).json({ message: 'Invalid credentials. User not found.' });
        }

        const user = rows[0];
        console.log(`[AUTH] Success: ${user.fname} ${user.lname} (${user.role_name})`);
        
        res.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                name: `${user.fname} ${user.lname}`,
                email: user.email,
                role: user.role_name,
                canRequest: !!user.can_request
            },
            token: 'mock-session-token-12345'
        });

    } catch (error) {
        console.error('Error in /api/login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

/**
 * Subsystem 5.5: Request Processing
 */
app.post('/api/requests', async (req, res) => {
    // This expects faculty_id, student_id, etc. from the Request Form
    const { faculty_id, student_id, building_id, room_id, semester_id } = req.body;
    console.log(`[REQUEST] New request submission from faculty ${faculty_id}`);

    try {
        const connection = await pool.getConnection();
        // Calls the Stored Procedure from request_v2.sql
        await connection.query(
            'CALL CreateRoomRequest(?, ?, ?, ?, ?)',
            [faculty_id, student_id, building_id, room_id, semester_id]
        );
        connection.release();

        console.log(`[REQUEST] Successfully created request.`);
        res.status(201).json({ message: 'Request submitted successfully!' });

    } catch (error) {
        console.error('Error in POST /api/requests:', error);
        if (error.sqlState === '45000') {
            console.log(`[REQUEST] Denied: ${error.message}`);
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error submitting request.' });
    }
});

/**
 * Subsystem 5.6: Workflow/Approval (GET ALL for Manager)
 */
app.get('/api/requests', async (req, res) => {
    console.log(`[WORKFLOW] GET all requests`);
    try {
        const connection = await pool.getConnection();
        // Use the VIEW from request_v2.sql
        const [rows] = await connection.query('SELECT * FROM student_request_status');
        connection.release();
        res.json(rows);

    } catch (error) {
        console.error('Error in GET /api/requests:', error);
        res.status(500).json({ message: 'Server error fetching requests.' });
    }
});

/**
 * Subsystem 5.6: Workflow/Approval (GET MINE for Faculty)
 */
app.get('/api/requests/faculty/:facultyId', async (req, res) => {
    const { facultyId } = req.params;
    console.log(`[WORKFLOW] GET requests for facultyId: ${facultyId}`);

    try {
        const connection = await pool.getConnection();
        // Use the VIEW from request_v2.sql and filter by faculty_id
        const [rows] = await connection.query(
            'SELECT * FROM student_request_status WHERE faculty_id = ?',
            [facultyId]
        );
        connection.release();
        res.json(rows);

    } catch (error) {
        console.error(`Error in GET /api/requests/faculty/${facultyId}:`, error);
        res.status(500).json({ message: 'Server error fetching faculty requests.' });
    }
});

/**
 * Subsystem 5.6: Workflow/Approval (PUT for Manager)
 */
app.put('/api/requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`[WORKFLOW] Updating request ${id} to ${status}`);

    if (!['Approved', 'Denied'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'UPDATE requests SET status = ? WHERE id = ?',
            [status, id]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        res.json({ message: `Request ${id} has been ${status}.` });

    } catch (error) {
        console.error(`Error in PUT /api/requests/${id}:`, error);
        res.status(500).json({ message: 'Server error updating request.' });
    }
});

/*
================================================================================
|   DATA LOOKUP ENDPOINTS (for Request Forms)
================================================================================
*/

/**
 * Gets all students for the request form
 */
app.get('/api/students', async (req, res) => {
    console.log(`[LOOKUP] GET all students`);
    try {
        const [rows] = await pool.query('SELECT id, student_id, fname, lname FROM students ORDER BY lname');
        res.json(rows);
    } catch (error) {
        console.error('Error in GET /api/students:', error);
        res.status(500).json({ message: 'Server error fetching students.' });
    }
});

/**
 * Gets all buildings for the request form
 */
app.get('/api/buildings', async (req, res) => {
    console.log(`[LOOKUP] GET all buildings`);
    try {
        const [rows] = await pool.query('SELECT id, building_name FROM buildings ORDER BY building_name');
        res.json(rows);
    } catch (error) {
        console.error('Error in GET /api/buildings:', error);
        res.status(500).json({ message: 'Server error fetching buildings.' });
    }
});

/**
 * Gets rooms for a specific building
 */
app.get('/api/rooms/:buildingId', async (req, res) => {
    const { buildingId } = req.params;
    console.log(`[LOOKUP] GET rooms for buildingId: ${buildingId}`);
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.room_number, rh.hierarchy_name 
             FROM rooms r
             JOIN room_hierarchy rh ON r.hierarchy_id = rh.id
             WHERE r.building_id = ? 
             ORDER BY r.room_number`,
            [buildingId]
        );
        res.json(rows);
    } catch (error) {
        console.error(`Error in GET /api/rooms/${buildingId}:`, error);
        res.status(500).json({ message: 'Server error fetching rooms.' });
    }
});

/**
 * Gets all semesters for the request form
 */
app.get('/api/semesters', async (req, res) => {
    console.log(`[LOOKUP] GET all semesters`);
    try {
        const [rows] = await pool.query('SELECT id, semester_name, year FROM semesters ORDER BY year DESC, semester_name DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error in GET /api/semesters:', error);
        res.status(500).json({ message: 'Server error fetching semesters.' });
    }
});

/**
 * Subsystem 5.7: Notification & Export
 */
app.get('/api/export/excel', async (req, res) => {
    console.log(`[EXPORT] Generating Excel report...`);
    // This is placeholder logic. A real implementation would use a library
    // like 'exceljs' to build and send a real file.
    res.json({ message: 'This endpoint will generate an Excel file.' });
});


// === Start the Server ===
app.listen(port, () => {
    console.log('================================================================================');
    console.log(`  Aggie One Access - APPLICATION LAYER (Server) is running on http://localhost:${port}`);
    console.log('  This server connects to your MySQL database.');
    console.log('  Your Next.js app (Presentation Layer) should make API calls to this server.');
    console.log('================================================================================');
});