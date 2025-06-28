
🗳️ VotePro - Online Voting System

VotePro is a secure, user-friendly online voting platform developed using Node.js, Express, MySQL, and vanilla HTML/CSS/JS. It allows users to register, log in, update their profile, cast votes, view results, and submit feedback.

📁 Project Structure

.
├── Login.html          # Login and Sign-Up UI
├── Main.html           # Main interface with voting, results, and feedback
├── Profile.html        # User profile form
├── server.js           # Node.js Express backend
├── VoterPro.sql        # MySQL database schema
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Exact dependency versions
└── public/             # Static files (if used)

🚀 Features

- 🔐 User Authentication: Sign-up & login with password hashing (bcrypt).
- 🧾 Profile Management: View and update personal details securely.
- 🗳️ Voting: Cast votes (one per user) for registered candidates.
- 📊 Results: View real-time voting statistics.
- 💬 Feedback: Submit user feedback for platform improvement.
- 📱 OTP UI Flow: Simulated OTP-based mobile verification in the frontend.

🔧 Installation

1. Clone the repository
   git clone https://github.com/your-repo/votepro.git
   cd votepro

2. Install dependencies
   npm install

3. Configure MySQL
   - Make sure MySQL is running.
   - Edit the database credentials in server.js:
     user: 'root',
     password: 'YOUR_MYSQL_PASSWORD',
     database: 'votepro_db'

4. Import the SQL Schema
   mysql -u root -p < VoterPro.sql

5. Start the server
   npm start

6. Open the App
   Open Login.html in your browser or host it using a static server.

📌 API Endpoints

Method | Endpoint        | Description
-------|------------------|---------------------------
POST   | /api/signup      | Register a new user
POST   | /api/login       | Authenticate user login
GET    | /api/profile     | Fetch user profile
POST   | /api/profile     | Update user profile
POST   | /api/vote        | Cast a vote
GET    | /api/results     | Fetch voting results
POST   | /api/feedback    | Submit feedback

📚 Technologies Used

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Security: bcryptjs for password hashing, CORS enabled

🧠 Notes

- OTP generation is simulated in frontend only (not linked with SMS/email service).
- No authentication tokens (e.g., JWT) are used; session management is basic/localStorage-based.
- Frontend forms require enhancements for production security.

📬 Feedback

If you'd like to contribute, suggest improvements, or report issues, feel free to open an issue or pull request.

📄 License

This project is licensed under the ISC License.
