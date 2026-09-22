import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, MessageCircle, Share2, Image, Video, Tag, 
  Send, User, Sparkles, TrendingUp, Home, Compass, Bookmark 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [currentUser] = useState('Alex Developer');
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    const formData = new FormData();
    formData.append('author', currentUser);
    formData.append('content', content);
    formData.append('tags', tags);
    if (file) {
      formData.append('media', file);
    }

    try {
      await axios.post(`${API_BASE}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContent('');
      setTags('');
      setFile(null);
      setFilePreview(null);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`${API_BASE}/posts/${postId}/like`, {
        username: currentUser
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/comment`, {
        author: currentUser,
        text
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Navigation */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <Sparkles style={{ color: '#6366f1' }} size={28} />
          <span style={styles.brandTitle}>VibeFeed</span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{currentUser[0]}</div>
          <span style={styles.username}>{currentUser}</span>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div style={styles.layout}>
        {/* Left Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.menuItemActive}><Home size={20} /> Feed</div>
          <div style={styles.menuItem}><Compass size={20} /> Explore</div>
          <div style={styles.menuItem}><Bookmark size={20} /> Saved</div>
          <div style={styles.menuItem}><User size={20} /> Profile</div>
        </aside>

        {/* Center Feed Content */}
        <main style={styles.feed}>
          {/* Post Creation Box */}
          <div style={styles.createCard}>
            <div style={styles.createHeader}>
              <div style={styles.avatar}>{currentUser[0]}</div>
              <textarea
                style={styles.textarea}
                placeholder="What's happening in tech today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {filePreview && (
              <div style={styles.previewContainer}>
                {file?.type.startsWith('video') ? (
                  <video src={filePreview} controls style={styles.mediaPreview} />
                ) : (
                  <img src={filePreview} alt="Upload Preview" style={styles.mediaPreview} />
                )}
              </div>
            )}

            <div style={styles.createControls}>
              <div style={styles.optionsGroup}>
                <label style={styles.iconButton}>
                  <Image size={18} color="#3b82f6" />
                  <span>Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                <label style={styles.iconButton}>
                  <Video size={18} color="#ef4444" />
                  <span>Video</span>
                  <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                <div style={styles.tagInputWrapper}>
                  <Tag size={16} color="#10b981" />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={styles.tagInput}
                  />
                </div>
              </div>

              <button style={styles.publishBtn} onClick={handleCreatePost}>
                Post <Send size={14} />
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          {posts.map((post) => (
            <article key={post._id} style={styles.postCard}>
              <div style={styles.postHeader}>
                <div style={styles.avatar}>{post.author[0]}</div>
                <div>
                  <div style={styles.authorName}>{post.author}</div>
                  <div style={styles.postTime}>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <p style={styles.postContent}>{post.content}</p>

              {post.mediaUrl && (
                <div style={styles.mediaContainer}>
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls style={styles.postMedia} />
                  ) : (
                    <img src={post.mediaUrl} alt="Post Attachment" style={styles.postMedia} />
                  )}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div style={styles.tagsContainer}>
                  {post.tags.map((tag, idx) => (
                    <span key={idx} style={styles.tagBadge}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div style={styles.actionsBar}>
                <button 
                  style={post.likedBy?.includes(currentUser) ? styles.likedBtn : styles.actionBtn} 
                  onClick={() => handleLike(post._id)}
                >
                  <Heart size={18} fill={post.likedBy?.includes(currentUser) ? '#ef4444' : 'none'} color={post.likedBy?.includes(currentUser) ? '#ef4444' : '#64748b'} />
                  <span>{post.likes}</span>
                </button>
                <button style={styles.actionBtn}>
                  <MessageCircle size={18} />
                  <span>{post.comments?.length || 0}</span>
                </button>
                <button style={styles.actionBtn}>
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comments Section */}
              <div style={styles.commentsSection}>
                {post.comments?.map((comment, i) => (
                  <div key={i} style={styles.commentItem}>
                    <strong style={{ color: '#0f172a' }}>{comment.author}: </strong>
                    <span>{comment.text}</span>
                  </div>
                ))}

                <div style={styles.commentInputRow}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                    style={styles.commentInput}
                  />
                  <button style={styles.sendCommentBtn} onClick={() => handleAddComment(post._id)}>
                    Reply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </main>

        {/* Right Sidebar - Trending */}
        <aside style={styles.sidebarRight}>
          <div style={styles.trendingCard}>
            <h3 style={styles.trendingTitle}><TrendingUp size={18} /> Trending Topics</h3>
            <div style={styles.trendItem}>#WebDevelopment <span>12.4k posts</span></div>
            <div style={styles.trendItem}>#ReactJS <span>8.9k posts</span></div>
            <div style={styles.trendItem}>#MongoDB <span>5.1k posts</span></div>
            <div style={styles.trendItem}>#ProdigyInfoTech <span>3.2k posts</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Inline Styles Object
const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#334155' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', sticky: 'top', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  username: { fontWeight: 600, color: '#1e293b' },
  layout: { display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '24px', maxWidth: '1200px', margin: '24px auto', padding: '0 16px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', fontWeight: 500 },
  menuItemActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 600 },
  feed: { display: 'flex', flexDirection: 'column', gap: '20px' },
  createCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  createHeader: { display: 'flex', gap: '12px' },
  textarea: { flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '0.95rem', fontFamily: 'inherit', minHeight: '60px' },
  previewContainer: { margin: '12px 0', borderRadius: '8px', overflow: 'hidden' },
  mediaPreview: { maxWidth: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px' },
  createControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' },
  optionsGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconButton: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' },
  tagInputWrapper: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' },
  tagInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '130px' },
  publishBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' },
  postCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  postHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  authorName: { fontWeight: 600, color: '#0f172a' },
  postTime: { fontSize: '0.75rem', color: '#94a3b8' },
  postContent: { fontSize: '0.95rem', lineHeight: '1.5', color: '#334155', marginBottom: '12px' },
  mediaContainer: { marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' },
  postMedia: { width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: '8px' },
  tagsContainer: { display: 'flex', gap: '8px', marginBottom: '12px' },
  tagBadge: { color: '#6366f1', fontSize: '0.85rem', fontWeight: 500 },
  actionsBar: { display: 'flex', gap: '20px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '8px 0', marginBottom: '12px' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' },
  likedBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  commentsSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  commentItem: { backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' },
  commentInputRow: { display: 'flex', gap: '8px', marginTop: '6px' },
  commentInput: { flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem', outline: 'none' },
  sendCommentBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' },
  sidebarRight: { display: 'flex', flexDirection: 'column', gap: '16px' },
  trendingCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' },
  trendingTitle: { fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0f172a' },
  trendItem: { display: 'flex', flexDirection: 'column', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '10px' }
};