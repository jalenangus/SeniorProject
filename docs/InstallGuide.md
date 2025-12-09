# AggieRequest System – Installation Guide

## 1 System Prerequisites
Before installing the system, make sure your machine has the following installed:
- Node.js version 18 or higher
- MySQL Server version 8.0 or higher
- MySQL Workbench
- Git (optional but recommended)

## 2 Database Installation
The system requires a MySQL database to store users and access requests.

1. Open MySQL Workbench.
2. Connect to your local MySQL server using hostname localhost and port 3306.
3. Locate the file named aggierequestdatabase.sql inside the database folder of your project files.
4. In MySQL Workbench, click File → Open SQL Script.
5. Select the file aggierequestdatabase.sql.
6. Click the lightning bolt icon to execute the script.

### 2.1 Verification
- Refresh the Schemas panel.
- Confirm the schema named ncat_studyroom exists.
- Confirm tables named 
  - requests
  - faculty
  - student
  - buildings

## 3 Backend Server Setup
The backend handles system logic and email notifications.

1. Open a terminal window.
2. Navigate to the backend folder by running: cd seniorproject-final/backend
3. Install dependencies by running: npm install
4. Open the server.js file in a text editor.
   - Find mysql.createPool.
5. Update the password field to match your MySQL root password.
6. Start the backend server by running: node server.js

### 3.1 Verification
Success messages should include: 
- Server running on http://localhost:3001
- Mail System Ready

## 4 Frontend Application Setup
The frontend provides the user interface.

1. Open a second terminal window.
2. Navigate to the frontend folder by running: cd seniorproject-final/frontend
3. Install dependencies by running: npm install
4. Launch the frontend application by running: npm run dev

### 4.1 Verification
If the frontend started successfully you should see:
- Ready in some number of milliseconds
- Open your browser and go to: http://localhost:3000

## 5 Troubleshooting
- If you see Connection Refused, make sure MySQL is running.
- If you see Access Denied for user 'root', confirm the password in server.js is correct.
- If you see Module not found, rerun npm install.
- If the server will not start, check your Node version using node -v.
- If MySQL will not connect, verify port 3306 is open.

