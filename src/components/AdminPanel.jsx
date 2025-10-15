import React, { useState } from 'react'

function Row({ it, onEdit, onTogglePublic }){
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,alignItems:'center',padding:'8px 10px',border:'1px solid rgba(0,0,0,0.06)',borderRadius:8,background:'rgba(255,255,255,0.6)'}}>
      <div>
        <div style={{fontWeight:600}}>{it.title}</div>
        <div className="muted">{it.type} • {new Date(it.createdAt).toLocaleString()}</div>
      </div>
      <button className="btn" onClick={()=>onTogglePublic(it.id)}>{it.isPublic ? 'Turn private' : 'Turn public'}</button>
      <button className="btn primary" onClick={()=>onEdit(it)}>Update</button>
    </div>
  )
}

export default function AdminPanel({ items, onClose, onLogout, onAdd, onEdit, onTogglePublic }){
  const [typeNew, setTypeNew] = useState('notebook')
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal admin-panel-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>Admin Dashboard</h3>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {onLogout && <button className="btn small" onClick={onLogout}>Logout</button>}
            <button className="btn ghost small" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{display:'grid',gap:12}}>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-number">{items.length}</div>
              <div className="stat-label">Total Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{items.filter(i=>i.isPublic).length}</div>
              <div className="stat-label">Public</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{items.filter(i=>!i.isPublic).length}</div>
              <div className="stat-label">Private</div>
            </div>
          </div>

          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <select value={typeNew} onChange={e=>setTypeNew(e.target.value)}>
              <option value="notebook">Notebook</option>
              <option value="drawing">Drawing</option>
              <option value="idea">Idea</option>
            </select>
            <button className="btn primary" onClick={()=>onAdd(typeNew)}>+ New {typeNew}</button>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {items.map(it => (
              <Row key={it.id} it={it} onEdit={onEdit} onTogglePublic={onTogglePublic} />
            ))}
            {items.length === 0 && <div className="muted">No items yet. Create your first one above.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DrawingEditor({ initial, onCancel, onSave }){
  const [title, setTitle] = useState(initial?.title || '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '')
  function removeImage(){ setImageUrl('') }
  function submit(){ onSave({ title: title.trim(), imageUrl: imageUrl.trim() }) }
  return (
    <div className="stack">
      <label>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <label>Image URL</label>
      <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Paste image URL or data URL" />
      <label>Or upload image</label>
      <input type="file" accept="image/*" onChange={async (e)=>{
        const file = e.target.files?.[0]
        if(!file) return
        const reader = new FileReader()
        reader.onload = ()=>{ setImageUrl(String(reader.result||'')) }
        reader.readAsDataURL(file)
      }} />
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="preview" style={{maxWidth:'100%',borderRadius:8}} />
          <div style={{marginTop:8}}>
            <button className="btn" onClick={removeImage}>Remove image</button>
          </div>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={submit}>Save</button>
      </div>
    </div>
  )
}

export function IdeaEditor({ initial, onCancel, onSave }){
  const [title, setTitle] = useState(initial?.title || '')
  const [text, setText] = useState(initial?.text || '')
  function submit(){ onSave({ title: title.trim(), text: text.trim() }) }
  return (
    <div className="stack">
      <label>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <label>Idea</label>
      <textarea rows={6} value={text} onChange={e=>setText(e.target.value)} />
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn primary" onClick={submit}>Save</button>
      </div>
    </div>
  )
}

// Attach editors to default export to import conveniently
AdminPanel.DrawingEditor = DrawingEditor
AdminPanel.IdeaEditor = IdeaEditor
