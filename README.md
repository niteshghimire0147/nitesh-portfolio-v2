# 🛡️ Nitesh Ghimire — Portfolio v2 (Bug-Fixed)

Full-stack MERN portfolio with Vite + Tailwind frontend and a complete CMS backend.
**Dark + Blue cybersecurity / hacker theme.**

---

## 🐛 Bugs Fixed in v2

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | `server.js` | Wrong import filenames (`testimonial.js`, `project.js`) | Corrected to `testimonials.js`, `projects.js` |
| 2 | `server.js` | `/api/news` route not registered | Added `newsRoutes` |
| 3 | `authController.js` | Register didn't lock after first admin | Added `countDocuments()` guard |
| 4 | `User.js` | Had `email` required field but register form didn't send it | Removed email, username+password only |
| 5 | `contact.js` | `process.env.ADMIN_EMAIL` was undefined | Changed to `process.env.EMAIL_USER` |
| 6 | `blog.js` / `ctf.js` | Missing `/admin/all` protected sub-routes | Added to both |
| 7 | `ProtectedRoute.jsx` | Redirected to `/login` (wrong path) | Fixed to `/admin/login` |
| 8 | `AuthContext.jsx` | `setUser(res.data.user)` — backend sends `{token, username}` | Fixed to `setUser({ username: res.data.username })` |
| 9 | `api.js` | 401 redirect caused infinite loop on login page | Added `pathname` guard |
| 10 | `tailwind.config.js` | `dark`, `darker`, `card`, `border` colors missing | All defined in `theme.extend.colors` |
| 11 | Duplicate files | `testimonial.js` + `testimonials.js`, `project.js` + `projects.js` | Removed duplicates |

---

## 📁 Project Structure

```
nitesh-portfolio/
├── backend/
│   ├── controllers/authController.js
│   ├── middleware/auth.js
│   ├── models/           User, Blog, CTF, Project, Testimonial
│   ├── routes/           auth, blog, ctf, projects, testimonials, contact, news
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── sections/ HeroSection, AboutSection, SkillsSection, ExperienceSection,
    │   │   │             ProjectsSection, CertificationsSection, TestimonialsSection,
    │   │   │             NewsSection, ContactSection
    │   │   ├── Navbar.jsx, Footer.jsx, AdminLayout.jsx, ProtectedRoute.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx, BlogList.jsx, BlogPost.jsx, CTFList.jsx, CTFPost.jsx
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx, AdminDashboard.jsx, AdminBlogs.jsx,
    │   │       ├── AdminCTF.jsx, AdminProjects.jsx, AdminTestimonials.jsx
    │   └── utils/api.js
    ├── index.html, vite.config.js, tailwind.config.js, postcss.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 2. Create Admin Account (run ONCE)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":""}'
```

> After this, the `/register` endpoint is permanently locked.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**
CMS: **http://localhost:5173/admin/login**

---

## ⚙️ Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/nitesh-portfolio
PORT=5000
JWT_SECRET=change_to_a_long_random_string_at_least_32_chars
CLIENT_URL=http://localhost:5173
EMAIL_USER=ghimirenitesh8@gmail.com
EMAIL_PASS=your_gmail_app_password
NEWS_API_KEY=your_newsapi_org_key
```

**Gmail App Password:**
1. Google Account → Security → 2FA → App Passwords
2. Generate for "Mail" and paste here

**NewsAPI (optional, free):**
- Register at https://newsapi.org → copy API key

---

## 🔐 CMS Features

| Section | Create | Edit | Delete | Publish |
|---------|--------|------|--------|---------|
| Blog Posts | ✅ | ✅ | ✅ | ✅ |
| CTF Writeups | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | — |
| Testimonials | — | — | ✅ | ✅ (Approve) |

All content supports **Markdown** with syntax highlighting.

---

## 🌐 Deployment

### Backend → Railway / Render
```bash
# Set env vars in dashboard, then deploy
git push heroku main
```

### Frontend → Vercel
1. Connect GitHub repo
2. Set `VITE_API_URL=https://your-backend.railway.app/api`
3. Update `src/utils/api.js` baseURL: `import.meta.env.VITE_API_URL || '/api'`

---

## 🎨 Theme

| Token | Value |
|-------|-------|
| Primary | `#00d4ff` (Cyan) |
| Secondary | `#0066ff` (Blue) |
| Background | `#0a0e1a` |
| Card | `#0d1526` |
| Display Font | Orbitron |
| Mono Font | JetBrains Mono |
| Body Font | Rajdhani |

---

Built by **Nitesh Ghimire** · [GitHub](https://github.com/niteshghimire0147) · [LinkedIn](https://www.linkedin.com/in/nitesh-ghimire-694104382/)
