const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');       
const PDFDocument = require('pdfkit');    

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// === Database Connection ===
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: 'jalen826', 
    database: 'ncat_studyroom'
});

// === Email Config ===
let transporter;
(async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log("[EMAIL] Mail System Ready");
    } catch(e) { console.log(e); }
})();

// === Helper: Send Email ===
async function sendEmail(to, subject, text) {
    if (!transporter || !to) return;
    try {
        const info = await transporter.sendMail({
            from: '"Aggie Access" <no-reply@ncat.edu>',
            to: to,
            subject: subject,
            text: text
        });
        console.log(`[EMAIL SENT] URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (e) { console.error("Email Error:", e); }
}

// === ENDPOINTS ===

// 1. LOGIN
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        // Check Faculty
        const [facultyRows] = await pool.query(
            `SELECT f.id, f.fname, f.lname, f.email, r.role_name 
             FROM faculty f JOIN roles r ON f.role_id = r.id 
             WHERE f.email = ?`, [email]
        );
        if (facultyRows.length > 0) {
            const user = facultyRows[0];
            return res.json({
                message: 'Login successful',
                user: { id: user.id, name: `${user.fname} ${user.lname}`, email: user.email, role: user.role_name },
                token: 'mock-token'
            });
        }
        // Check Students
        const [studentRows] = await pool.query(`SELECT * FROM students WHERE email = ?`, [email]);
        const [reqRows] = await pool.query(`SELECT student_name_text, student_email FROM requests WHERE student_email = ? LIMIT 1`, [email]);

        if (studentRows.length > 0 || reqRows.length > 0) {
            const name = studentRows.length > 0 ? `${studentRows[0].fname} ${studentRows[0].lname}` : reqRows[0].student_name_text;
            return res.json({
                message: 'Student Login',
                user: { id: 0, name: name, email: email, role: 'Student' },
                token: 'mock-token'
            });
        }
        res.status(401).json({ message: 'User not found' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. EXPORT EXCEL
app.get('/api/export/excel', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM student_request_status');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Requests');
        
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Student', key: 'student_name', width: 20 },
            { header: 'Email', key: 'student_email', width: 25 },
            { header: 'Building', key: 'building_name', width: 15 },
            { header: 'Room', key: 'room_number', width: 10 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Reason', key: 'reason', width: 30 }
        ];
        sheet.addRows(rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=requests.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) { 
        console.error(err);
        res.status(500).send('Export Excel Error'); 
    }
});

// 3. EXPORT PDF
app.get('/api/export/pdf', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM student_request_status');
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=requests.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Aggie Access Report', { align: 'center' });
        doc.moveDown();

        rows.forEach(r => {
            doc.fontSize(12).text(`Request #${r.id} - ${r.status}`);
            doc.fontSize(10).text(`Student: ${r.student_name} (${r.student_email})`);
            doc.text(`Location: ${r.building_name} ${r.room_number}`);
            doc.text(`Reason: ${r.reason}`);
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (err) { 
        console.error(err);
        res.status(500).send('Export PDF Error'); 
    }
});

// 4. REQUEST MANAGEMENT (Submit, Update, Get)
app.post('/api/requests', async (req, res) => {
    const { faculty_id, student_name, student_email, building_id, room_id, semester_id, reason } = req.body;
    try {
        await pool.query('CALL CreateRoomRequest(?, ?, ?, ?, ?, ?, ?)', 
            [faculty_id, student_name, student_email, building_id, room_id, semester_id, reason]);
        
        // Email logic...
        const [b] = await pool.query('SELECT building_name FROM buildings WHERE id = ?', [building_id]);
        const [managers] = await pool.query(`SELECT f.email FROM building_manager bm JOIN faculty f ON bm.faculty_id = f.id WHERE bm.building_id = ?`, [building_id]);
        
        if (managers.length > 0) {
            const emails = managers.map(m => m.email).join(',');
            await sendEmail(emails, `New Request: ${b[0]?.building_name}`, `Student: ${student_name}\nReason: ${reason}`);
        }

        res.status(201).json({ message: 'Request submitted' });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

app.put('/api/requests/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM student_request_status WHERE id = ?', [req.params.id]);
        await pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);
        
        if (rows.length > 0) {
            const r = rows[0];
            const msg = `Your request for ${r.building_name} has been ${status}.`;
            await sendEmail(r.student_email, `Status Update: ${status}`, msg);
        }
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/requests', async (req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM student_request_status'); res.json(rows); } catch (err) { res.status(500).json(err); }
});
app.get('/api/requests/student', async (req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM student_request_status WHERE student_email = ?', [req.query.email]); res.json(rows); } catch (err) { res.status(500).json(err); }
});
app.get('/api/requests/faculty/:id', async (req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM student_request_status WHERE faculty_id = ?', [req.params.id]); res.json(rows); } catch (err) { res.status(500).json(err); }
});

// === USER MANAGEMENT ENDPOINTS ===

// 5. GET ALL USERS (Faculty + Students)
app.get('/api/users', async (req, res) => {
    try {
        // Get Faculty
        const [faculty] = await pool.query(`
            SELECT f.id, f.fname, f.lname, f.email, r.role_name, 'Faculty' as type 
            FROM faculty f 
            JOIN roles r ON f.role_id = r.id
        `);
        
        // Get Students
        const [students] = await pool.query(`
            SELECT id, fname, lname, email, 'Student' as role_name, 'Student' as type 
            FROM students
        `);

        // Combine them
        res.json([...faculty, ...students]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. UPDATE FACULTY ROLE
app.put('/api/users/faculty/:id', async (req, res) => {
    const { role_name } = req.body;
    try {
        // Find the role ID
        const [roles] = await pool.query('SELECT id FROM roles WHERE role_name = ?', [role_name]);
        if (roles.length === 0) return res.status(400).json({ message: 'Invalid Role' });
        
        const roleId = roles[0].id;
        
        // Update Faculty
        await pool.query('UPDATE faculty SET role_id = ? WHERE id = ?', [roleId, req.params.id]);
        res.json({ message: 'Role updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. DELETE USER (Student or Faculty)
app.delete('/api/users/:type/:id', async (req, res) => {
    const { type, id } = req.params; // type = 'student' or 'faculty'
    try {
        if (type.toLowerCase() === 'student') {
            await pool.query('DELETE FROM students WHERE id = ?', [id]);
        } else if (type.toLowerCase() === 'faculty') {
            await pool.query('DELETE FROM faculty WHERE id = ?', [id]);
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ message: 'Error deleting user. They might have active requests.' }); 
    }
});

// Lookups
app.get('/api/buildings', async (req, res) => { const [rows] = await pool.query('SELECT id, building_name FROM buildings'); res.json(rows); });
app.get('/api/rooms/:bid', async (req, res) => { const [rows] = await pool.query('SELECT id, room_number FROM rooms WHERE building_id = ? ORDER BY CAST(room_number AS UNSIGNED)', [req.params.bid]); res.json(rows); });
app.get('/api/semesters', async (req, res) => { const [rows] = await pool.query('SELECT id, semester_name FROM semesters'); res.json(rows); });
app.get('/api/students', async (req, res) => { const [rows] = await pool.query('SELECT id, fname, lname FROM students'); res.json(rows); });

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});