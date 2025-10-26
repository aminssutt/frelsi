import React, { useState } from 'react'
import Doodles from './Doodles'

function Row({ it, onEdit, onTogglePublic }){
  const authorName = it.author === 'amar' ? 'Amar' : 'Lakhdar'
  return (
    <div className="admin-row">
      <div className="admin-row-content">
        <div className="admin-row-title">{it.title}</div>
        <div className="admin-row-meta">
          <span className="type-badge">
            {it.type === 'notebook' ? '📓' : it.type === 'idea' ? '💡' : '🎨'} {it.type}
          </span>
          <span className="admin-row-date">{new Date(it.createdAt).toLocaleDateString()}</span>
          {it.author && <span className="author-badge">👤 {authorName}</span>}
          <span className={`visibility-badge ${it.isPublic ? 'public' : 'private'}`}>
            {it.isPublic ? '👁️ Public' : '🔒 Private'}
          </span>
        </div>
      </div>
      <div className="admin-row-actions">
        <button className="btn small" onClick={()=>onTogglePublic(it.id)}>
          {it.isPublic ? '🔒 Make Private' : '👁️ Make Public'}
        </button>
        <button className="btn primary small" onClick={()=>onEdit(it)}>✏️ Edit</button>
      </div>
    </div>
  )
}

export default function AdminPanel({ items, onClose, onLogout, onAdd, onEdit, onTogglePublic, onNavigate }){
  const [typeNew, setTypeNew] = useState('notebook')
  return (
    <div className="admin-panel-page">
      <Doodles />
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-header-actions">
          {onNavigate && (
            <>
              <button className="btn" onClick={()=>onNavigate('home')}>🏠 Home</button>
              <button className="btn" onClick={()=>onNavigate('discover')}>🔍 Discover</button>
            </>
          )}
          {onLogout && <button className="btn" onClick={onLogout}>🚪 Logout</button>}
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-number">{items.filter(i=>i.isPublic).length}</div>
            <div className="stat-label">Public</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-number">{items.filter(i=>!i.isPublic).length}</div>
            <div className="stat-label">Private</div>
          </div>
        </div>

        <div className="admin-actions">
          <select value={typeNew} onChange={e=>setTypeNew(e.target.value)} className="admin-select">
            <option value="notebook">📓 Notebook</option>
            <option value="drawing">🎨 Drawing</option>
            <option value="idea">💡 Idea</option>
          </select>
          <button className="btn primary" onClick={()=>onAdd(typeNew)}>+ New {typeNew}</button>
        </div>

        <div className="admin-items-wrapper">
          <div className="admin-items-list">
            {items.map(it => (
              <Row key={it.id} it={it} onEdit={onEdit} onTogglePublic={onTogglePublic} />
            ))}
            {items.length === 0 && (
              <div className="admin-empty">
                <div className="empty-icon">📝</div>
                <p>No items yet. Create your first one above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DrawingEditor({ initial, onCancel, onSave }){
  const [title, setTitle] = useState(initial?.title || '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '')
  const [author, setAuthor] = useState(initial?.author || 'lakhdar')
  function removeImage(){ setImageUrl('') }
  function submit(){ 
    if(!title.trim()){
      alert('Please enter a title')
      return
    }
    onSave({ title: title.trim(), imageUrl: imageUrl.trim(), author }) 
  }
  
  return (
    <div className="editor-modal-content">
      <div className="editor-header-section">
        <div className="editor-icon">🎨</div>
        <h3 className="editor-modal-title">{initial ? 'Edit Drawing' : 'New Drawing'}</h3>
        <p className="editor-modal-subtitle">Add a visual creation to your collection</p>
      </div>
      
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="drawing-author">Auteur *</label>
          <select 
            id="drawing-author"
            className="editor-input"
            value={author} 
            onChange={e=>setAuthor(e.target.value)}
          >
            <option value="lakhdar">👤 Lakhdar Berache</option>
            <option value="amar">👤 Amar Berache</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="drawing-title">Title *</label>
          <input 
            id="drawing-title"
            className="editor-input"
            value={title} 
            onChange={e=>setTitle(e.target.value)}
            placeholder="Give your drawing a name..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="drawing-url">Image URL</label>
          <input 
            id="drawing-url"
            className="editor-input"
            value={imageUrl} 
            onChange={e=>setImageUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="drawing-upload">Or Upload Image</label>
          <div className="file-upload-wrapper">
            <input 
              id="drawing-upload"
              type="file" 
              accept="image/*"
              className="file-upload-input"
              onChange={(e)=>{
                const file = e.target.files?.[0]
                if(!file) return
                const reader = new FileReader()
                reader.onload = ()=>{ setImageUrl(String(reader.result||'')) }
                reader.readAsDataURL(file)
              }} 
            />
            <label htmlFor="drawing-upload" className="file-upload-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Choose file
            </label>
          </div>
        </div>
        
        {imageUrl && (
          <div className="image-preview-section">
            <label>Preview</label>
            <div className="image-preview">
              <img src={imageUrl} alt="preview" />
              <button className="btn small remove-image-btn" onClick={removeImage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="editor-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={submit}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Drawing
        </button>
      </div>
    </div>
  )
}

export function IdeaEditor({ initial, onCancel, onSave }){
  const [title, setTitle] = useState(initial?.title || '')
  const [text, setText] = useState(initial?.text || '')
  const [author, setAuthor] = useState(initial?.author || 'lakhdar')
  
  function submit(){ 
    if(!title.trim()){
      alert('Please enter a title')
      return
    }
    onSave({ title: title.trim(), text: text.trim(), author }) 
  }
  
  return (
    <div className="editor-modal-content">
      <div className="editor-header-section">
        <div className="editor-icon">💡</div>
        <h3 className="editor-modal-title">{initial ? 'Edit Idea' : 'New Idea'}</h3>
        <p className="editor-modal-subtitle">Capture your brilliant thoughts and insights</p>
      </div>
      
      <div className="editor-form">
        <div className="form-group">
          <label htmlFor="idea-author">Auteur *</label>
          <select 
            id="idea-author"
            className="editor-input"
            value={author} 
            onChange={e=>setAuthor(e.target.value)}
          >
            <option value="lakhdar">👤 Lakhdar Berache</option>
            <option value="amar">👤 Amar Berache</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="idea-title">Title *</label>
          <input 
            id="idea-title"
            className="editor-input"
            value={title} 
            onChange={e=>setTitle(e.target.value)}
            placeholder="What's your idea about?"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="idea-text">Description</label>
          <textarea 
            id="idea-text"
            className="editor-textarea"
            rows={8} 
            value={text} 
            onChange={e=>setText(e.target.value)}
            placeholder="Describe your idea in detail..."
          />
          <div className="char-count">{text.length} characters</div>
        </div>
      </div>
      
      <div className="editor-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={submit}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Idea
        </button>
      </div>
    </div>
  )
}

// Attach editors to default export to import conveniently
AdminPanel.DrawingEditor = DrawingEditor
AdminPanel.IdeaEditor = IdeaEditor
