# 🎯 Quick Attendance – Real-Time Face Recognition Attendance System

> 🚀 A final-year capstone project to revolutionize attendance management using AI-powered face recognition, built with a full-stack MERN + FastAPI architecture.

---

## 📸 Live Demo (Optional)
<!-- [![Demo](https://img.shields.io/badge/Live-Demo-blue)](https://your-demo-link.com) -->

---

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Future Scope](#future-scope)
- [License](#license)

---

## 🧠 Project Overview

**Quick Attendance** is an intelligent web platform that automates student attendance using **real-time face recognition**. Teachers can manage classes, record attendance using a webcam, and generate detailed reports. Students can track their attendance history and request updates for corrections.

Built as a full-stack solution integrating AI (face recognition) with robust web backend and frontend technologies.

---

## ✨ Features

👩‍🏫 **For Teachers**
- Live face recognition for marking attendance
- Manual attendance updates
- Attendance request approval/rejection
- Class creation, deletion, and student management
- PDF report generation

🧑‍🎓 **For Students**
- View attendance history
- Request corrections
- Track attendance percentage per subject

🔐 **Other Highlights**
- Multi-face detection
- WebSocket real-time communication
- Role-based access (student/teacher)
- Attendance reports exportable in print-ready format

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React, HTML/CSS, JavaScript       |
| Backend      | FastAPI (Python), Express.js (Node.js) |
| Database     | MongoDB                           |
| Face Recognition | OpenCV, `face_recognition` (dlib) |
| Communication| WebSockets                        |

---

## 🧩 System Architecture

```plaintext
React Frontend
    |
    v
Express.js (Attendance Server) <--> MongoDB
    |
    v
FastAPI (Face Recognition API) <--> OpenCV + dlib
