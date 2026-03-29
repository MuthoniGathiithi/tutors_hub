# EduTrack – Teacher's Class Report Portal

A beautiful, simple class report system for teachers. Create session reports, track student marks and generate shareable links for parents.

## Features
- 📅 Record: Date, Day, Time, Subject, Class/Grade, Teacher
- 📖 Lesson: Topic, Sub-topic, Page reference, Content covered, Homework, Next class plan
- 👩‍🎓 Students: Name, Adm No., Marks, Grade, Behaviour, Individual remarks
- 🔗 Per-student shareable links for parents
- 💬 Bulk WhatsApp sharing
- 🖨️ Print-ready parent report

## Deploy to Vercel

### Option 1 – Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2 – Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework: Vite (auto-detected)
4. Click Deploy ✅

## Local Development
```bash
npm install
npm run dev
```

## How It Works
- Teacher fills in session + student details → saves to browser localStorage
- Each student gets a unique URL: `yoursite.com/#/report/SESSION_ID/STUDENT_ID`
- Teacher copies/WhatsApps those links to parents
- Parent opens link → sees their child's report (read-only, beautiful view)
