# VibeFeed — Social Media Platform

A modern full-stack social media application built as part of the **Prodigy InfoTech Full Stack Web Development Internship (Task 05)** using the MERN stack.

---

## 🚀 Features

- **Post Creation & Feed**: Share text posts, attach photos and videos using `multer`, and include custom hashtags.
- **Engagement System**: Interactive post likes with dynamic user count and real-time like toggling.
- **Commenting System**: Threaded comments section for user discussions on posts.
- **Trending Topics Sidebar**: Real-time side panel highlighting popular tech tags and topics.
- **Modern UI/UX**: Clean, card-based interface featuring custom layout grids, glassmorphism elements, and Lucide React icons.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Axios, Lucide React Icons
- **Backend**: Node.js, Express.js, Multer (File Storage)
- **Database**: MongoDB & Mongoose Schema Modeling

---

## 📂 Project Structure

```text
fs task 5/
├── client/          # React Frontend application
│   ├── public/      # Static templates & assets
│   ├── src/         # App.js & main components
│   └── package.json
├── server/          # Node.js Express API Server
│   ├── uploads/     # Stored image & video attachments
│   ├── server.js    # Express routes, Mongoose schemas, Multer config
│   └── package.json
├── .gitignore
└── README.md

🧪 Quick Test Workflow
Open http://localhost:3000 in your browser.

Type a message in the post creation field and add tags (e.g. WebDev, MERN, React).

Click Photo or Video to attach media and click Post.

Test the Heart button to like posts and write replies in the comment section!
