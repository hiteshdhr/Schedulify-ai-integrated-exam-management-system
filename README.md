# 📅🤖 Schedulify: AI-Integrated Academic Management Platform

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/hiteshdhr/Schedulify-ai-integrated-exam-management-system/actions)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)](/CONTRIBUTING.md)

**Schedulify** is an advanced, AI-driven platform designed to automate the complexities of academic scheduling, exam management, and student life. Powered by a robust **MERN stack** core plus specialized **Python microservices**, Schedulify manages automated exam timetabling, generates smart study schedules, parses academic PDFs, and offers role-based chatbot assistance.

---

## 🚀 Key Features

### 📆 Smart Study Scheduler
- **Personalized 7-day plans:** Adjusts for subject importance, lets you define study/break lengths, and prevents burnout.
- **Efficiency analytics:** Calculates a study efficiency score based on time allocation.
- **Flexible customization:** Update or re-balance schedules in seconds.

### 🔢 Automated Exam Timetabling (Admin)
- **Optimized with Google OR-Tools CP-SAT Solver** to ensure no conflicts, with built-in constraints for room capacity, instructor schedules, and course overlaps.
- **Bulk operations:** Old schedules are auto-cleared and new ones populated directly in MongoDB.

### 🤖 Intelligent Chatbot Assistant
- **Role-based conversational AI:** 
  - Students: Get exam dates, next test reminders, and study materials.
  - Instructors: Check invigilation duties or trigger timetable generation.
- **Proactive actions:** The bot can suggest or even create tasks for users, cutting down manual effort.

### 📄 Advanced PDF Parsing
- **AI-Powered Extraction:** Upload academic PDFs (datesheets, syllabi) and Schedulify uses Python (`pdfplumber`, Regex) to extract structured, actionable data.
- **Syllabus parsing:** Populates task lists automatically from document content.

---

## 🛠 Tech Stack

| Layer            | Technologies                                                   |
|------------------|---------------------------------------------------------------|
| **Frontend**     | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion       |
| **UI Components**| Shadcn/UI, Lucide React, Sonner (Toasts)                      |
| **Backend API**  | Node.js, Express.js                                           |
| **Database**     | MongoDB & Mongoose ODM                                        |
| **AI/ML**        | Python, Scikit-learn (Logistic Regression), NLTK              |
| **Optimization** | Google OR-Tools (CP-SAT/Constraint Programming)               |
| **PDF Parsing**  | Pdfplumber, Regex, Multer                                     |
| **Authentication**| JWT, BcryptJS                                                |

---

## 🏗 Architecture

Schedulify runs on a distributed service-oriented architecture:
- **Main API (`server/`, Port 5000):** Handles auth, core data, and orchestrates between services.
- **Solver Service (`solver_service/`, Port 5001):** Python Flask + OR-Tools for master scheduling.
- **Chatbot Service (`schedulify_chatbot/`, Port 5002):** Python Flask + NLP (Scikit-learn) for AI chat.

---

## 👥 Role-Based Access Control

- **Student:** Dashboard, study scheduler, tasks, exam notifications.
- **Instructor:** Invigilation duties, department timetables.
- **Admin:** Full system, automated scheduling, resource management, analytics.

---

## 📂 Project Structure

```
Schedulify-ai-integrated-exam-management-system/
├── frontend/ (React)
│   ├── src/components/   # UI Components (shadcn/ui)
│   ├── src/context/      # Global/auth state
│   ├── src/hooks/        # Custom React hooks
│   ├── src/pages/        # Page-level components
│   └── src/lib/          # Utility functions
│
├── Backend/ (Node/Express)
│   ├── src/config/       # DB/env config
│   ├── src/controllers/  # Logic handlers
│   ├── src/middleware/   # Auth/file middlewares
│   ├── src/models/       # Mongoose schemas
│   ├── src/routes/       # API endpoints
│   └── src/utils/        # Notification/helpers
│
├── solver_service/       # Python CP-SAT/OR-Tools Flask API
│   └── solver.py         
│   └── requirements.txt
│
└── schedulify_chatbot/   # Python Chatbot API
    ├── intent_chatbot.py
    └── intents.json
```

---

## 🚦 Quickstart (Local Setup)

1. **Clone the repo & install dependencies:**
    ```bash
    git clone https://github.com/hiteshdhr/Schedulify-ai-integrated-exam-management-system.git
    cd Schedulify-ai-integrated-exam-management-system

    # Backend
    cd Backend
    npm install

    # Frontend
    cd ../frontend
    npm install

    # Python microservices
    cd ../solver_service
    pip install -r requirements.txt

    cd ../schedulify_chatbot
    pip install -r requirements.txt
    ```

2. **Start Each Service:**
    - Backend:  
      `cd Backend && npm start`
    - Frontend:  
      `cd frontend && npm run dev`
    - Solver Service:  
      `cd solver_service && python solver.py`
    - Chatbot Service:  
      `cd schedulify_chatbot && python intent_chatbot.py`

3. **Environment:**
    - Add your `.env` files for backend services (see any sample or `README` inside `/Backend`).

4. **Visit:**  
    Frontend - `http://localhost:5173`  
    Backend API - `http://localhost:5000`  
    Solver Service - `http://localhost:5001`  
    Chatbot Service - `http://localhost:5002`

---

## 📡 API Reference

API documentation is available via route comments or [Swagger/Postman collection](#) (provide link if available).

**Key Endpoints:**
- `POST /api/schedule/generate` – Triggers master scheduler (admin)
- `POST /api/pdf/parse` – PDF datesheet/syllabus extraction (admin/instructor)
- `POST /api/chatbot/message` – Intelligent assistant endpoint
- `GET /api/user/tasks` – User tasks
- ... and more!

---

## 🧑‍💻 Contributing

Contributions are welcome!  
- Fork the repo, create a branch, open a PR.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
- Found a bug? Open an issue!

---

## 📺 Demo

> Add screenshots, GIFs, or a Loom link here to showcase Schedulify in action.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Credits

- Thanks to all contributors, testers, and the maintainers of open-source tools used in Schedulify!

---

## ✨ Future Roadmap

- Mobile app (React Native)
- Calendar sync (Google/Microsoft)
- Support for other universities/boards
- Pluggable integration with external LMS platforms

---

> **Maintained with ❤️ by [@hiteshdhr](https://github.com/hiteshdhr) and contributors.**
