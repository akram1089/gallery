export default function ImageCard({ image, onDelete }) {
  // Since we are behind a reverse proxy in dev/prod, 
  // uploads will be served at /uploads/...
  const imageUrl = `/uploads/${image.filename}`;
  
  // Format date safely
  const dateStr = new Date(image.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="image-card glass-panel">
      <div className="card-img-wrapper">
        <img 
          src={imageUrl} 
          alt={image.original_name} 
          className="card-img"
          loading="lazy"
        />
      </div>
      <div className="card-content">
        <div className="card-desc">
          {image.description || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No description provided.</span>}
        </div>
        <div className="card-meta">
          <span>{dateStr}</span>
          <button 
            type="button" 
            className="delete-btn" 
            onClick={onDelete}
            title="Delete this image"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
