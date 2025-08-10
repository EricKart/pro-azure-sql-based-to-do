🚀 Pro To-Do List | Azure SQL Project
Welcome to the Professional To-Do List application! This is a feature-rich, full-stack web application designed to be a powerful task management tool. It's built with a Node.js backend, a dynamic vanilla JavaScript frontend, and is powered by a robust Azure SQL database.

This project was built step-by-step, starting from a basic database connection and evolving into a fully deployed, professional-grade application. It's an excellent showcase of modern web development practices and cloud deployment.

✨ Features
📝 Full CRUD Operations: Create, Read, Update, and Delete tasks seamlessly.

🗓️ Due Dates & Times: Set precise deadlines for each task.

🚦 Priority Levels: Organize tasks with High, Medium, and Low priority indicators.

✅ Status Tracking: Move tasks between "To Do," "In Process," and "Done."

🔍 Filtering & Sorting: Instantly filter tasks by status or sort them by creation date or due date.

🎨 Modern UI/UX: A clean, beautiful, and fully responsive interface that works on all devices.

☁️ Cloud Powered: Deployed and running live on Microsoft Azure.

🛠️ Tech Stack
Backend: Node.js, Express.js

Database: Microsoft Azure SQL

Frontend: HTML5, Tailwind CSS, Vanilla JavaScript

Deployment: GitHub Actions for CI/CD, Azure App Service

⚙️ Running Locally
To get this project running on your local machine, follow these steps:

Clone the repository:

git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

Navigate to the project directory:

cd your-repository-name

Install backend dependencies:

npm install

Set up your database:

Create an Azure SQL database.

Run the CREATE TABLE script found in the project to set up the Tasks table.

Configure Environment Variables:

Create a .env file in the root directory.

Add your database credentials to the .env file:

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=your_server.database.windows.net
DB_DATABASE=your_db_name

Note: The deployed version reads these from Azure App Service settings.

Start the server:

node server.js

Open the application:

Open the public/index.html file in your web browser.

👨‍💻 Author
Aryan Tripathi

🌐 Website: aryantripathi.me

💼 LinkedIn: linkedin.com/in/ary-tripathi

📧 Email: aryktripathi@gmail.com