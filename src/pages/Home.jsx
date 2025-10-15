import React, { useState, useMemo, useEffect } from 'react'

const sample = [
  { id: 1, title: "L'Ombre de la Ville", excerpt: 'A stroll through the city: solitude and lights.', tag: 'Noir', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10 },
  { id: 2, title: 'Le Doute du Matin', excerpt: "Small moments and thoughts upon waking.", tag: 'Reflection', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 3, title: "Promenade d'Automne", excerpt: 'Leaves, wind, melancholy.', tag: 'Nature', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 }
]



function Modal({ children, onClose, title }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn ghost small" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

function formatDate(ts){
  const d = new Date(ts)
  return d.toLocaleDateString()
}

function generateRecommendations(note){
  // lightweight static mapping to simulate external recommendations
  const library = {
    noir: {
      books: ['La Nuit du Chien', 'Rue des Disparus'],
      films: ['Drive', 'Blade Runner 2049'],
      animes: ['Ergo Proxy', 'Texhnolyze']
    },
    Nature: {
      books: ['Walden', 'The Overstory'],
      films: ['Into the Wild', 'A Hidden Life'],
      animes: ['Mushishi', 'Children of the Sea']
    },
    reflection: {
      books: ['Essais de Montaigne', 'The Unbearable Lightness of Being'],
      films: ['Ikiru', 'Anomalisa'],
      animes: ['Haibane Renmei', 'A Silent Voice']
    },
    default: {
      books: ['Sugg. : The Library', 'Sugg. : A Quiet Life'],
      films: ['Sugg. Film 1', 'Sugg. Film 2'],
      animes: ['Sugg. Anime 1', 'Sugg. Anime 2']
    }
  }
  const key = (note.tag || '').toString().toLowerCase()
  return library[key] || library.default
}

export default function Home({ onLogout, user, notebooks = [], onOpenNew, onOpenEdit, onOpenView, openUpdateOnLoad }) {
  const [items, setItems] = useState(() => notebooks.length ? notebooks : sample)
  const [showNew, setShowNew] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [showView, setShowView] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState({ tag: '', q: '' })

  const tags = useMemo(()=>{ return Array.from(new Set(items.map(i=>i.tag))) },[items])

  function createNote(data){
    const id = Math.max(0, ...items.map(i=>i.id)) + 1
    const note = { id, ...data, createdAt: Date.now() }
    setItems([note, ...items])
    setShowNew(false)
  }

  function updateNote(id, patch){
    setItems(items.map(i => i.id === id ? { ...i, ...patch } : i))
    setShowUpdate(false)
    setSelected(null)
  }

  function openGenerateFor(note){
    setSelected(note)
    setShowGenerate(true)
  }

  const filtered = items.filter(i => {
    if (filter.tag && i.tag !== filter.tag) return false
    if (filter.q && !(`${i.title} ${i.excerpt}`.toLowerCase().includes(filter.q.toLowerCase()))) return false
    return true
  })

  useEffect(()=>{
    if(openUpdateOnLoad) setShowUpdate(true)
  },[openUpdateOnLoad])

  return (
    <div className="home-root">

      <header className="home-hero">
        <h1>Frelsi</h1>
        <p>Your space for writing and inspiration — organize, tag, and explore.</p>
      </header>

      <main className="cards">
        <div className="filters-row">
          <div className="filter-left">
            <select value={filter.tag} onChange={(e)=>setFilter(s=>({...s, tag:e.target.value}))}>
              <option value="">All themes</option>
              {tags.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Search..." value={filter.q} onChange={(e)=>setFilter(s=>({...s,q:e.target.value}))} />
          </div>
          <div className="filter-right">Showing {filtered.length} / {items.length}</div>
        </div>

        {filtered.map((it, idx) => (
          <article key={it.id} className="card" style={{ animationDelay: `${idx * 120}ms` }}>
            <div className="card-left" />
            <div className="card-body">
              <div className="card-meta">{it.tag} • {formatDate(it.createdAt)}</div>
              <h3>{it.title}</h3>
              <p className="excerpt">{it.excerpt}</p>
              <div className="card-actions">
                <button className="pill" onClick={()=>{ if(onOpenEdit) onOpenEdit(it); else { setSelected(it); setShowUpdate(true) } }}>Update</button>
                <button className="pill" onClick={()=>openGenerateFor(it)}>Generate</button>
              </div>
            </div>
          </article>
        ))}
      </main>

      {showNew && (
        <Modal title="Create a new notebook" onClose={()=>setShowNew(false)}>
          <NewForm onCreate={createNote} />
        </Modal>
      )}

      {showUpdate && (
        <Modal title={selected ? 'Edit notebook' : 'Choose a notebook to edit'} onClose={()=>{setShowUpdate(false); setSelected(null)}}>
          {selected ? <UpdateForm note={selected} onUpdate={(patch)=>updateNote(selected.id, patch)} /> : (
            <div className="choose-list">
              {items.map(it=> (
                <div key={it.id} className="choose-item" onClick={()=>setSelected(it)}>
                  <strong>{it.title}</strong>
                  <div className="muted">{it.tag} • {formatDate(it.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showView && (
        <Modal title="Filter and browse" onClose={()=>setShowView(false)}>
          <div style={{display:'grid',gap:10}}>
            <label>Tag</label>
            <select onChange={(e)=>setFilter(s=>({...s, tag:e.target.value}))} value={filter.tag}>
              <option value="">All</option>
              {tags.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
            <label>Date range</label>
            <div style={{display:'flex',gap:8}}>
              <input type="date" onChange={(e)=>setFilter(s=>({...s, from:e.target.value}))} />
              <input type="date" onChange={(e)=>setFilter(s=>({...s, to:e.target.value}))} />
            </div>
            <label>Keywords</label>
            <input placeholder="e.g.: solitude, autumn" value={filter.q} onChange={(e)=>setFilter(s=>({...s,q:e.target.value}))} />
            <div className="muted">Results: {filtered.length}</div>
            <div style={{marginTop:8}}>
              <strong>Click a notebook to open in View mode.</strong>
            </div>
            <div className="choose-list">
              {filtered.map(it=> (
                <div key={it.id} className="choose-item" onClick={()=>{ if(onOpenView) onOpenView(it); }}>
                  <strong>{it.title}</strong>
                  <div className="muted">{it.tag} • {formatDate(it.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showGenerate && (
        <Modal title={selected ? `Generate for: ${selected.title}` : 'Generate recommendations'} onClose={()=>{setShowGenerate(false); setSelected(null)}}>
          {selected ? (
            <GenerateView note={selected} onClose={()=>{setShowGenerate(false); setSelected(null)}} />
          ) : (
            <div style={{display:'grid',gap:8}}>
              <div className="muted">Select a notebook to generate suggestions.</div>
              <div className="choose-list">
                {items.map(it=> (
                  <div key={it.id} className="choose-item" onClick={()=>setSelected(it)}>
                    <strong>{it.title}</strong>
                    <div className="muted">{it.tag} • {formatDate(it.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function NewForm({ onCreate }){
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tag, setTag] = useState('Reflection')

  function submit(e){
    e.preventDefault()
    if(!title.trim()) return
    onCreate({ title: title.trim(), excerpt: excerpt.trim(), tag: tag.trim() })
  }

  return (
    <form onSubmit={submit} className="stack">
      <label>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <label>Excerpt / description</label>
      <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={4} />
      <label>Tag / Theme</label>
      <input value={tag} onChange={e=>setTag(e.target.value)} />
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button type="button" className="btn" onClick={()=>{setTitle(''); setExcerpt(''); setTag('')}}>Reset</button>
        <button type="submit" className="btn primary">Create</button>
      </div>
    </form>
  )
}

function UpdateForm({ note, onUpdate }){
  const [title, setTitle] = useState(note?.title || '')
  const [excerpt, setExcerpt] = useState(note?.excerpt || '')
  const [tag, setTag] = useState(note?.tag || '')

  function submit(e){
    e.preventDefault()
    onUpdate({ title: title.trim(), excerpt: excerpt.trim(), tag: tag.trim() })
  }

  return (
    <form onSubmit={submit} className="stack">
      <label>Title</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} />
      <label>Excerpt</label>
      <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={4} />
      <label>Tag</label>
      <input value={tag} onChange={e=>setTag(e.target.value)} />
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button type="submit" className="btn primary">Save</button>
      </div>
    </form>
  )
}

function GenerateView({ note }){
  const rec = generateRecommendations(note)
  return (
    <div className="generate-grid">
      <section>
        <h4>Books</h4>
        <ul>{rec.books.slice(0,3).map((b,i)=>(<li key={i}>{b}</li>))}</ul>
      </section>
      <section>
        <h4>Films / Series</h4>
        <ul>{rec.films.slice(0,3).map((b,i)=>(<li key={i}>{b}</li>))}</ul>
      </section>
      <section>
        <h4>Animes / Visual works</h4>
        <ul>{rec.animes.slice(0,3).map((b,i)=>(<li key={i}>{b}</li>))}</ul>
      </section>
    </div>
  )
}

