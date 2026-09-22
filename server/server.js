const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB Local Connection
mongoose.connect('mongodb://127.0.0.1:27017/social_media_db')
  .then(() => console.log('MongoDB Database Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// File Upload Configuration via Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Post Schema
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
  content: { type: String, required: true },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, default: '' }, // 'image' or 'video'
  tags: [{ type: String }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  comments: [{
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// User Profile Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  bio: { type: String, default: 'Exploring new technologies & connecting with developers.' },
  role: { type: String, default: 'Full Stack Intern' },
  followers: { type: Number, default: 128 },
  following: { type: Number, default: 94 }
});

const User = mongoose.model('User', userSchema);

// API ROUTES

// 1. Fetch Feed Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Post with Media Upload & Tags
app.post('/api/posts', upload.single('media'), async (req, res) => {
  try {
    const { author, content, tags } = req.body;
    let mediaUrl = '';
    let mediaType = '';

    if (req.file) {
      mediaUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim().replace(/^#/, '')) : [];

    const newPost = new Post({
      author: author || 'Anonymous Developer',
      content,
      mediaUrl,
      mediaType,
      tags: parsedTags
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Like / Unlike Post
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const hasLiked = post.likedBy.includes(username);
    if (hasLiked) {
      post.likedBy = post.likedBy.filter(u => u !== username);
      post.likes -= 1;
    } else {
      post.likedBy.push(username);
      post.likes += 1;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Add Comment
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { author, text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ author, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get User Profile
app.get('/api/users/:username', async (req, res) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    if (!user) {
      user = new User({ username: req.params.username });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Social Media API running on http://localhost:${PORT}`);
});