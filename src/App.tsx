import React, { useState } from 'react';
import { Download, Youtube, Sparkles, AlertCircle, Edit3 } from 'lucide-react';
import ThumbnailEditor from './components/ThumbnailEditor';

interface ThumbnailQuality {
  name: string;
  label: string;
  url: string;
  available?: boolean;
}

function App() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [thumbnails, setThumbnails] = useState<ThumbnailQuality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingThumbnail, setEditingThumbnail] = useState<ThumbnailQuality | null>(null);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const checkImageExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const getThumbnails = async () => {
    setError('');
    setLoading(true);
    
    const id = extractVideoId(url);
    if (!id) {
      setError('Please enter a valid YouTube URL');
      setLoading(false);
      return;
    }

    setVideoId(id);

    const qualities: Omit<ThumbnailQuality, 'available'>[] = [
      { name: 'maxresdefault', label: 'MaxRes (1280×720)', url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` },
      { name: 'hqdefault', label: 'HQ (480×360)', url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` },
      { name: 'mqdefault', label: 'MQ (320×180)', url: `https://img.youtube.com/vi/${id}/mqdefault.jpg` },
      { name: 'sddefault', label: 'SD (640×480)', url: `https://img.youtube.com/vi/${id}/sddefault.jpg` },
      { name: 'default', label: 'Default (120×90)', url: `https://img.youtube.com/vi/${id}/default.jpg` },
    ];

    const thumbnailChecks = await Promise.all(
      qualities.map(async (quality) => ({
        ...quality,
        available: await checkImageExists(quality.url),
      }))
    );

    setThumbnails(thumbnailChecks.filter(t => t.available));
    setLoading(false);
  };

  const downloadThumbnail = async (thumbnail: ThumbnailQuality) => {
    try {
      const response = await fetch(thumbnail.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoId}_${thumbnail.name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleEditThumbnail = (thumbnail: ThumbnailQuality) => {
    setEditingThumbnail(thumbnail);
  };

  const handleSaveEditedThumbnail = (dataUrl: string, filename: string) => {
    // Create a download link for the edited image
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setEditingThumbnail(null);
  };

  const handleCloseEditor = () => {
    setEditingThumbnail(null);
  };

  return (
    <>
    <div className="liquid-glass-app">
      {/* Animated Background */}
      <div className="background-layer">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="app-container">
        {/* Header Section */}
        <header className="app-header">
          <div className="logo-container glass-element">
            <Youtube className="logo-icon" />
          </div>
          <h1 className="app-title">
            YouTube Thumbnail
            <span className="title-accent">Downloader</span>
          </h1>
          <p className="app-subtitle">
            Extract high-quality thumbnails with Apple's signature glass design
          </p>
        </header>

        {/* Input Section */}
        <section className="input-section">
          <div className="glass-container input-container">
            <div className="input-group">
              <label htmlFor="youtube-url" className="input-label">
                YouTube Video URL
              </label>
              <div className="input-wrapper">
                <input
                  type="url"
                  id="youtube-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="glass-input"
                />
              </div>
            </div>
            
            <button
              onClick={getThumbnails}
              disabled={loading || !url.trim()}
              className="glass-button primary-button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Fetching Thumbnails...</span>
                </>
              ) : (
                <>
                  <Sparkles className="button-icon" />
                  <span>Get Thumbnails</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="error-section">
            <div className="glass-container error-container">
              <AlertCircle className="error-icon" />
              <p className="error-message">{error}</p>
            </div>
          </section>
        )}

        {/* Thumbnails Gallery */}
        {thumbnails.length > 0 && (
          <section className="thumbnails-section">
            <h2 className="section-title">Available Thumbnails</h2>
            <div className="thumbnails-grid">
              {thumbnails.map((thumbnail, index) => (
                <div
                  key={thumbnail.name}
                  className="thumbnail-card glass-element"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="thumbnail-preview">
                    <img
                      src={thumbnail.url}
                      alt={`${thumbnail.label} thumbnail`}
                      className="thumbnail-image"
                      loading="lazy"
                    />
                    <div className="thumbnail-overlay">
                      <button
                        onClick={() => downloadThumbnail(thumbnail)}
                        className="glass-button download-button"
                      >
                        <Download className="button-icon" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="thumbnail-info">
                    <h3 className="thumbnail-title">{thumbnail.label}</h3>
                    <div className="thumbnail-actions">
                      <button
                        onClick={() => handleEditThumbnail(thumbnail)}
                        className="glass-button secondary-button"
                      >
                        <Edit3 className="button-icon" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => downloadThumbnail(thumbnail)}
                        className="glass-button secondary-button"
                      >
                        <Download className="button-icon" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && thumbnails.length === 0 && !error && url && (
          <section className="empty-state">
            <div className="glass-container empty-container">
              <Youtube className="empty-icon" />
              <p className="empty-message">No thumbnails found for this video</p>
            </div>
          </section>
        )}
      </div>
    </div>

    {/* Thumbnail Editor Modal */}
    {editingThumbnail && (
      <ThumbnailEditor
        imageUrl={editingThumbnail.url}
        filename={`${videoId}_${editingThumbnail.name}.jpg`}
        onSave={handleSaveEditedThumbnail}
        onClose={handleCloseEditor}
      />
    )}
    </>
  );
}

export default App;