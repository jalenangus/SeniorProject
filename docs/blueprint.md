# **App Name**: AggieAccess

## Core Features:

- Simulated Login: Simulates user authentication (Faculty/Building Manager) with role-based redirection to appropriate dashboards.
- New Access Request Form: Allows faculty to submit access requests for students, capturing details like student ID, building, room number, and justification.
- Request Validation and Persistence: Validates request data and persists it to the MySQL database using a stored procedure, enforcing role-based access control.
- Approval Workflow: Building Managers can view and act on pending requests through a dedicated dashboard, with actions updating the request status in the database.
- Simulated Notifications: Generates simulated email notifications upon request approval/denial to inform relevant users.
- Excel Report Generation: Generates formatted Excel reports containing request details for documentation purposes.
- Building Recommendation Tool: AI tool that suggests appropriate buildings based on the justification entered by the faculty, improving request accuracy and efficiency.

## Style Guidelines:

- Primary color: NCAT Aggie Blue (#00305E) to align with the university's branding.
- Background color: Light gray (#E0E0E0) for a clean, professional interface.
- Accent color: NCAT Aggie Gold (#FFB81C) for highlighting interactive elements and important notifications.
- Body and headline font: 'PT Sans', a humanist sans-serif, combines a modern look and a little warmth or personality. Code font: 'Source Code Pro' for displaying SQL or code snippets.
- Use clear, simple icons to represent actions and status within the system, improving usability.
- Maintain a consistent, structured layout to facilitate easy navigation and information retrieval.
- Use subtle animations for loading states and transitions to enhance the user experience.