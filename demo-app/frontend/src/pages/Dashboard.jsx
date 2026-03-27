import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadsAPI } from '../api/client';
import ImageCard from '../components/ImageCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      setUser(JSON.parse(storedUser));
      fetchImages();
    };
    checkAuth();
  }, [navigate]);

  const fetchImages = async () => {
    try {
      const { data } = await uploadsAPI.getAll();
      setImages(data.uploads || []);
    } catch (err) {
      console.error('Failed to fetch images', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);

    try {
      await uploadsAPI.upload(formData);
      setFile(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchImages(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await uploadsAPI.delete(id);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <header className="dashboard-header">
        <h1>Gallery App</h1>
        <div className="user-info">
          <span>Hello, <strong>{user.username}</strong></span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <section className="upload-section glass-panel">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Upload New Image</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleUpload}>
          <div className="input-group">
            <input 
              type="file" 
              accept="image/*"
              className="input-field"
              required
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="input-group">
            <textarea
              className="input-field"
              placeholder="Add a description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <button type="submit" disabled={uploading || !file}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </section>

      <section className="gallery-section">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Your Gallery</h2>
        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }} className="glass-panel">
            No images uploaded yet.
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map(img => (
              <ImageCard 
                key={img.id} 
                image={img} 
                onDelete={() => handleDelete(img.id)} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
