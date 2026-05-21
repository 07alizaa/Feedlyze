# Feedlyze

**Feedlyze** is a full-stack digital feedback management platform designed to help small and medium-sized businesses collect, manage, and analyze customer feedback in a smarter way. Instead of using paper feedback forms or manually reading every response, businesses can create digital surveys, share them through QR codes, and view AI-powered insights from customer responses.

The main goal of Feedlyze is to make feedback collection simple for customers and useful for business owners. Customers can scan a QR code and submit feedback without creating an account, while vendors can view responses, sentiment analysis, trends, and actionable insights through a dashboard.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Overview](#system-overview)
- [Project Screenshots](#project-screenshots)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Folder Structure](#folder-structure)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## About the Project

Many small businesses still collect customer feedback through paper forms, verbal comments, or informal messages. This makes it difficult to organize responses, understand customer satisfaction, and identify repeated complaints. Feedlyze solves this problem by providing a digital platform where businesses can create surveys, collect responses, and automatically analyze feedback.

The platform includes a drag-and-drop survey builder, QR code-based survey sharing, public feedback submission, AI sentiment analysis, and a business dashboard. This helps business owners understand what customers are saying and make better decisions based on real feedback.

---

## Key Features

### 1. Drag-and-Drop Survey Builder

Business users can create custom feedback forms using a drag-and-drop interface. Questions can be added, reordered, and customized based on the business need.

**Supported question types include:**

- Text response
- Rating question
- Multiple choice question

---

### 2. QR Code-Based Survey Sharing

Each survey generates a unique public survey link and QR code. Businesses can place the QR code in shops, restaurants, cafés, or service areas so customers can quickly scan and submit feedback.

---

### 3. Public Feedback Submission

Customers do not need to log in to submit feedback. They can access the survey through a public link or QR code and submit their responses easily.

---

### 4. AI-Based Sentiment Analysis

Feedlyze analyzes customer feedback and classifies responses into meaningful sentiment categories such as positive, negative, or neutral. This helps businesses quickly understand customer satisfaction without manually reading every response.

---

### 5. Business Dashboard

The dashboard presents feedback data in a clear and visual way. It helps business users identify patterns, common issues, satisfaction levels, and improvement areas.

---

### 6. Secure Authentication

The platform includes JWT-based authentication so that only registered business users can create surveys, manage forms, and view dashboard insights.

---

### 7. Feedback and Response Management

Business users can view submitted feedback, analyze customer responses, and track feedback trends over time.

---

## Tech Stack

### Frontend

- React.js
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Drag-and-drop library

### Backend

- Node.js
- Express.js
- RESTful APIs
- JWT Authentication
- MVC-inspired architecture

### Database

- PostgreSQL

### AI and Services

- AI-based sentiment analysis
- QR code generation service

### Deployment and Tools

- Docker
- AWS EC2
- GitHub Actions
- Postman
- Git and GitHub

---

## System Overview

Feedlyze follows a full-stack architecture where the frontend communicates with the backend using REST APIs. The backend handles authentication, survey management, response submission, QR code generation, and AI analysis. PostgreSQL is used to store users, surveys, questions, responses, answers, and AI analysis results.

### Basic Flow

1. Business user registers or logs in.
2. User creates a feedback survey.
3. The system generates a unique survey link and QR code.
4. Customer scans the QR code and submits feedback.
5. Backend stores the response in the database.
6. AI service analyzes the feedback sentiment.
7. Dashboard displays feedback insights to the business user.

---

## Installation and Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/feedlyze.git
cd feedlyze
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

### 4. Set Up Environment Variables

Create a `.env` file inside the backend folder and add the required variables.

```env
PORT=5000
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
AI_API_KEY=your_ai_api_key
```

---

### 5. Run the Backend Server

```bash
cd backend
npm run dev
```

The backend server should run on:

```bash
http://localhost:5000
```

---

### 6. Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend should run on:

```bash
http://localhost:5173
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `DATABASE_URL` | PostgreSQL database connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `FRONTEND_URL` | Frontend application URL |
| `AI_API_KEY` | API key for AI-based feedback analysis |

---

## API Overview

### Authentication Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/profile` | Get logged-in user profile |

---

### Survey Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/surveys` | Create a new survey |
| `GET` | `/api/surveys` | Get all surveys of logged-in user |
| `GET` | `/api/surveys/:id` | Get survey by ID |
| `PUT` | `/api/surveys/:id` | Update survey |
| `DELETE` | `/api/surveys/:id` | Delete survey |

---

### Public Survey Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/surveys/public/:shortCode` | Get public survey using short code |
| `POST` | `/api/responses/:surveyId` | Submit customer feedback response |

---

### Insight Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/insights/dashboard` | Get dashboard feedback insights |
| `GET` | `/api/insights/advanced` | Get advanced AI-generated insights |

---

## Folder Structure

```bash
feedlyze/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── jobs/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── index.html
│
├── README.md
└── docker-compose.yml
```

---

## Future Improvements

- Add email notifications for new feedback
- Add export option for feedback reports
- Add more advanced AI insight summaries
- Add multi-business/team support
- Add role-based access control
- Add monthly feedback trend comparison
- Add support for custom survey themes
- Add offline feedback collection support

---

## Author

**Aliza Simkhada**

- GitHub: [07alizaa](https://github.com/07alizaa)
- LinkedIn: [Aliza Simkhada](https://www.linkedin.com/in/aliza-simkhada-711265287/)

---

## Project Status

Feedlyze is currently under development and continuously being improved with better analytics, AI-powered insights, and user experience enhancements.
