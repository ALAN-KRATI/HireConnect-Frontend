# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 🚀 HireConnect Frontend

Frontend for **HireConnect** – a job platform connecting candidates and recruiters with features like job search, applications, interviews, and analytics.

---

## 🧠 Tech Stack

- React (Vite)
- JavaScript (ES6+)
- Axios (API calls)
- React Router (Navigation)
- Tailwind CSS / CSS (Styling)
- JWT Authentication

---

## 📁 Project Structure

```
src/
│
├── components/        # Reusable UI components
├── pages/             # Main pages (Login, Dashboard, Jobs, etc.)
├── services/          # API calls (Axios configs)
├── utils/             # Helper functions
├── hooks/             # Custom hooks
├── context/           # Global state (Auth, etc.)
├── assets/            # Images, icons
└── App.jsx            # Main app component
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo

```bash
git clone <your-frontend-repo-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm run dev
```

App will run on:

```
http://localhost:5173
```

---

## 🔐 Authentication Flow

- User logs in → JWT token received
- Token stored in `localStorage`
- Token attached in API requests via Axios interceptor
- Protected routes validate authentication

---

## 🌐 API Integration

Backend services:

- Auth Service → Login/Register
- Profile Service → Resume & profile
- Job Service → Job listings
- Application Service → Apply & tracking
- Interview Service → Scheduling
- Notification Service → Alerts

Base URL example:

```js
http://localhost:8080
```

---

## 📦 Key Features

### 👤 Candidate

- Register / Login
- Browse & search jobs
- Apply to jobs
- Track application status
- Upload resume
- Save/bookmark jobs

### 🏢 Recruiter

- Post & manage jobs
- View applicants
- Shortlist / reject candidates
- Schedule interviews
- View analytics dashboard

---

## 🔧 Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Lint code
```

---

## 🐞 Common Issues

### Token not working?

- Check if token exists in `localStorage`
- Ensure Axios headers include:

```js
Authorization: Bearer <token>
```

---

### CORS Error?

- Make sure backend allows frontend origin

---

### API not working?

- Check backend is running
- Verify base URL is correct

---

## 📌 Future Improvements

- Add frontend testing (Jest / Cypress)
- Improve state management (Redux / Zustand)
- UI enhancements & animations
- Dark mode support 🌙

---

## 👨‍💻 Developer Notes

- Keep components reusable
- Avoid hardcoding API URLs
- Handle errors properly
- Maintain clean folder structure

---

## 📜 License

This project is for educational purposes.