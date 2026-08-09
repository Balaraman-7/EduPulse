# EduPulse: AI-Powered Student Dropout Early Warning and Counselling System

[![Full Stack Architecture](https://img.shields.io/badge/Architecture-Full%20Stack-blue)](docs/architecture.md)
[![ML Engine](https://img.shields.io/badge/ML%20Service-FastAPI%20%2B%20Scikit--Learn-green)](docs/ml.md)
[![Generative AI](https://img.shields.io/badge/AI-Google%20Gemini-purple)](docs/api.md)

**EduPulse** is an academic-grade, production-quality full-stack web application designed to identify students at risk of academic dropout, explain contributing risk factors using Machine Learning (ML) and Explainable AI (XAI), provide Gemini-powered personalized counselling recommendations and study plans, and enable faculty counsellors to log, monitor, and resolve student interventions.

---

## 🌟 Key Features

### 🏛️ Admin Subsystem
- **Institution Risk Analytics Dashboard**: Real-time charts powered by Recharts (Risk distribution pie, department/semester statistics, attendance vs risk, CGPA vs risk, monthly intervention trend).
- **Student Roster & Directory**: Full CRUD, advanced multi-filter (department, semester, risk level, search query), faculty assignment, and manual ML model triggers.
- **Faculty Management**: Add, view, and assign faculty members to at-risk students.
- **Official Institution Reports**: Printable/exportable summary reports for academic administration review.

### 👨‍🏫 Faculty / Counsellor Subsystem
- **High-Risk Alert Banner**: High-priority alert notification for students exceeding risk thresholds.
- **Assigned Student Roster**: View assigned student metrics sorted by highest risk score first.
- **Explainable AI (XAI) View**: Deep-dive into student profile with ML feature importance bars explaining *why* a student is classified at risk.
- **Gemini AI Counselling Guidelines**: Natural language risk explanations, faculty action items, and student study plans.
- **Intervention Workflow Tracker**: Log counselling notes, agree on action items, set follow-up review dates, and transition intervention status (`New Alert` $\rightarrow$ `Under Review` $\rightarrow$ `Counselling Scheduled` $\rightarrow$ `Intervention Active` $\rightarrow$ `Improving` $\rightarrow$ `Monitoring` $\rightarrow$ `Resolved`).

### 🎓 Student Subsystem
- **Empathetic Dashboard**: Non-alarmist risk overview using supportive phrasing ("Your current academic indicators suggest that additional guidance may be helpful").
- **Academic Metrics Grid**: Quick view of attendance, CGPA, backlogs, internal test scores, and assignment submittals.
- **Gemini Study Strategy**: Personalized weekly study goals and motivating encouragement notes.
- **Interactive AI Counselling Chatbot**: Conversational Gemini bot providing study tips, backlog strategies, time management guidance, and mandatory safety notices.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4 (60:30:10 design palette), React Router v7, Recharts, Axios, Lucide React.
- **Backend API**: Node.js, Express.js REST API, MongoDB (Mongoose ORM), JWT Authentication, bcryptjs password hashing.
- **Machine Learning Microservice**: Python 3.12, FastAPI, Uvicorn, Scikit-Learn, Pandas, NumPy, Joblib, SHAP / Feature Importances.
- **Generative AI**: Google Gemini API (1.5 Flash).

---

## 📁 Repository Folder Structure

```text
edupulse/
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── config/           # DB Connection
│   │   ├── controllers/      # Auth, Student, Faculty, Prediction, AI, Counselling, Analytics
│   │   ├── middleware/       # JWT Auth & Role Middleware (RBAC), Error Handler
│   │   ├── models/           # Mongoose Schemas (User, Student, Prediction, Counselling, Recommendation)
│   │   ├── routes/           # REST Endpoints
│   │   ├── services/         # ML Service Client & Gemini API Integration
│   │   ├── utils/            # Seed script for demo data
│   │   └── index.js          # Express entry point
│   └── package.json
│
├── frontend/                 # React 19 + Vite SPA
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, RiskBadge, StatCard, StudentModal, CounsellingLogModal
│   │   ├── context/          # AuthContext with demo quick-fill login
│   │   ├── pages/            # Login, AdminDashboard, AdminStudents, FacultyDashboard, StudentDetail, StudentDashboard, AICounsellor, Reports
│   │   ├── services/         # Axios interceptor
│   │   └── App.jsx
│   └── package.json
│
├── ml-service/               # Python FastAPI Microservice
│   ├── data/                 # Synthetic student dataset CSV
│   ├── models/               # Trained joblib models & metadata JSON
│   ├── src/                  # generate_dataset.py, train.py, predict.py
│   ├── main.py               # FastAPI server
│   └── requirements.txt
│
├── docs/                     # Viva Documentation
│   ├── architecture.md       # High-level architecture & data flow
│   ├── api.md                # Complete REST API reference
│   ├── ml.md                 # ML model selection, metrics, XAI explanation
│   └── setup.md              # Installation & execution guide
│
├── .env.example
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Seed Demo Data & Start Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

### 2. Start ML Prediction Microservice
```bash
cd ml-service
pip install -r requirements.txt
python src/train.py
python main.py
```

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:3000`

---

## 🔑 Demo Credentials (Viva Quick Access)

Use the 1-click **Viva Demo Instant Access** bar on the login page:
- **Admin**: `admin@demo.local` / `admin123`
- **Faculty**: `faculty@demo.local` / `faculty123`
- **Student**: `student@demo.local` / `student123`

---

## 🎓 Academic Viva FAQ

### Q1: Why is Machine Learning used instead of hard-coded rules?
*Answer*: ML models evaluate non-linear feature combinations (e.g. low attendance combined with high backlogs and low internal test scores) simultaneously without requiring fragile static thresholds.

### Q2: Why is Gemini NOT used as the dropout prediction engine?
*Answer*: LLMs are non-deterministic and subject to numerical hallucination. Deterministic ML models (Scikit-Learn) calculate quantitative risk scores, while Gemini is used exclusively for qualitative natural language explanations, study recommendations, and conversational support.

### Q3: Why is Recall prioritized over Precision in model evaluation?
*Answer*: In early warning systems, False Negatives (failing to identify a student who will drop out) have far higher consequences than False Positives (spending a few minutes checking in on a student who is safe). High recall ensures maximum coverage of vulnerable students.
