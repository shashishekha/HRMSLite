HRMSLite - Human Resource Management System
A full-stack, production-ready application for managing employee records and tracking attendance. This project demonstrates a decoupled architecture with a Python/Django API and a modern React/Vite frontend.

📖 Project Overview
HRMSLite is designed to streamline HR operations. It allows administrators to:

Manage Employees: Add and view employee profiles with unique IDs and department categorization.

Attendance Tracking: Record daily attendance status (Present/Absent/Late) linked to specific employees.

The app is fully deployed with the backend hosted on Render (using a PostgreSQL database) and the frontend hosted on Vercel.

🛠 Tech Stack
Backend
Framework: Django & Django REST Framework (DRF)

Database: PostgreSQL (Production), PostgreSQL (Local Development)

Server: Gunicorn (Production)

CORS: django-cors-headers for secure cross-origin communication.

Frontend
Library: React (Vite)

State Management: React Hooks (useState, useEffect)

Styling: Modular CSS (Component-based architecture)

1. Run Backend locally steps:

# Clone the repository
git clone https://github.com/shashishekha/HRMSLite.git
cd HRMSLite/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver

2. Run Frontend locally steps:

# Open a new terminal
cd HRMSLite/frontend

# Install dependencies
npm install

# Create a .env file and add your local backend URL
echo "VITE_API_URL=http://127.0.0.1:8000/api/" > .env

# Start the development server
npm run dev
