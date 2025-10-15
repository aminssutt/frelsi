import React, { useState, useRef, useEffect } from 'react'
import NewEditor from './pages/NewEditor'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'

// Public card for items
function PublicItemCard({ item, onOpen }){
  return (
    <article className="card" onClick={()=>onOpen?.(item)} style={{cursor:'pointer'}}>
      <div className="card-left" />
      <div className="card-body">
        <div className="card-meta">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</div>
        <h3>{item.title}</h3>
        {item.type === 'notebook' && (
          <div className="excerpt" dangerouslySetInnerHTML={{ __html: item.bodyHtml?.slice(0, 280) + ((item.bodyHtml?.length||0) > 280 ? '...' : '') }} />
        )}
        {item.type === 'idea' && (
          <p className="excerpt">{item.text?.slice(0, 180)}{(item.text?.length||0) > 180 ? '…' : ''}</p>
        )}
        {item.type === 'drawing' && item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} style={{maxWidth:'100%',borderRadius:8,marginTop:8}} />
        )}
      </div>
    </article>
  )
}

export default function App() {
  const [items, setItems] = useState([]) // {id,type,title,createdAt,isPublic, bodyHtml|imageUrl|text}
  const [adminMode, setAdminMode] = useState(false)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [errors, setErrors] = useState([])
  const [editor, setEditor] = useState({ open:false, type:null, item:null })
  const editorRef = useRef(null)
  const [navConfirm, setNavConfirm] = useState({ show:false, onContinue:null })
  const [discoverMode, setDiscoverMode] = useState(false)
  const [filter, setFilter] = useState({ type:'', q:'' })
  const [typedTitle, setTypedTitle] = useState('')
  const [readingItem, setReadingItem] = useState(null)
  const [showReadConfirm, setShowReadConfirm] = useState(null)

  // bootstrap from localStorage or seed samples
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('frelsi_items')
      if(raw){
        const arr = JSON.parse(raw)
        if(Array.isArray(arr) && arr.length > 0) { setItems(arr); return }
      }
    }catch(e){ console.warn('failed to load items', e) }
    // seed with rich default notebooks
    const now = Date.now()
    const seeded = [
      { 
        id:1, 
        type:'notebook', 
        title:"Réflexions sur l'Innovation", 
        createdAt: now-86400000*7, 
        isPublic:true, 
        bodyHtml:'<div style="position:relative;min-height:200px;"><h2>L\'art de créer</h2><p>L\'innovation ne naît pas du vide. Elle émerge de la curiosité, de l\'observation et du courage de remettre en question le statu quo. Chaque idée commence par une étincelle — parfois insignifiante — qui peut transformer notre façon de voir le monde.</p><h3>Les piliers de la créativité</h3><ul><li>Observer sans jugement</li><li>Questionner l\'évidence</li><li>Connecter l\'inattendu</li><li>Persévérer malgré l\'échec</li></ul><p style="font-style:italic;color:#8c7b73;margin-top:20px;">« La créativité, c\'est l\'intelligence qui s\'amuse. » — Albert Einstein</p></div>' 
      },
      { 
        id:2, 
        type:'notebook', 
        title:"Notes de Voyage Imaginaire", 
        createdAt: now-86400000*5, 
        isPublic:true, 
        bodyHtml:'<div style="position:relative;min-height:200px;"><h2>Entre ciel et terre</h2><p>J\'ai toujours été fasciné par les voyages qui n\'existent que dans nos pensées. Ces destinations où le temps n\'a pas de prise, où les règles de la physique s\'effacent devant l\'imagination.</p><blockquote style="border-left:3px solid #b57b6b;padding-left:15px;margin:20px 0;font-style:italic;">Le voyage le plus long commence par un simple rêve éveillé.</blockquote><p>Dans ces mondes parallèles, chaque pas nous rapproche de qui nous voulons vraiment être. Pas de bagages, pas de frontières — juste la liberté pure de l\'esprit.</p></div>' 
      },
      { 
        id:3, 
        type:'idea', 
        title:'Projet: Jardins Urbains Connectés', 
        createdAt: now-86400000*3, 
        isPublic:true, 
        text:'Imaginer un réseau de micro-jardins en ville, où chaque citoyen pourrait cultiver ses propres légumes. Une app connecterait les jardiniers amateurs, partagerait des conseils en temps réel et créerait une communauté locale autour de la permaculture urbaine. Impact: réduction de l\'empreinte carbone, lien social, autonomie alimentaire.' 
      },
      { 
        id:4, 
        type:'notebook', 
        title:"Méditations Matinales", 
        createdAt: now-86400000*2, 
        isPublic:true, 
        bodyHtml:'<div style="position:relative;min-height:200px;"><h2>Le rituel du matin</h2><p>Chaque matin est une renaissance. Une page blanche où nous pouvons choisir qui nous voulons être aujourd\'hui.</p><p>Ma routine :</p><ol><li><strong>5 minutes de silence</strong> — Observer ses pensées sans s\'y accrocher</li><li><strong>Gratitude</strong> — Noter 3 choses pour lesquelles je suis reconnaissant</li><li><strong>Intention</strong> — Définir une qualité à incarner dans la journée</li></ol><p style="margin-top:20px;padding:15px;background:rgba(181,123,107,0.1);border-radius:8px;">💡 <em>Insight du jour: La paix intérieure ne vient pas de l\'absence de chaos, mais de notre capacité à rester centré malgré la tempête.</em></p></div>' 
      },
      { 
        id:5, 
        type:'idea', 
        title:'Design: Interface sans Écran', 
        createdAt: now-86400000*1, 
        isPublic:true, 
        text:'Et si on concevait des interfaces qui n\'utilisent pas d\'écrans ? Interactions vocales, haptiques, lumière ambiante, sons spatialisés. Objectif: réduire la fatigue visuelle et créer des expériences plus humaines et moins intrusives. Applications: domotique, véhicules autonomes, espaces publics.' 
      },
      { 
        id:6, 
        type:'drawing', 
        title:'Croquis Abstrait #1', 
        createdAt: now-86400000*4, 
        isPublic:false, 
        imageUrl:'' 
      }
    ]
    setItems(seeded)
  }, [])

  // persist
  useEffect(()=>{
    try{ localStorage.setItem('frelsi_items', JSON.stringify(items)) }catch(e){ console.warn('save items failed', e) }
  }, [items])

  // global error capture (dev)
  useEffect(()=>{
    function onErr(msg, url, line, col, err){
      const payload = { msg: msg?.toString(), url, line, col, stack: err?.stack }
      console.error('[Captured Error]', payload)
      setErrors(prev => [...prev, payload])
      return false
    }
    function onUnhandledRejection(ev){
      console.error('[UnhandledRejection]', ev.reason)
      setErrors(prev => [...prev, { msg: ev.reason?.toString ? ev.reason.toString() : String(ev.reason), stack: ev.reason?.stack }])
    }
    window.addEventListener('error', onErr)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return ()=>{
      window.removeEventListener('error', onErr)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  // Public items (needed early for useEffect dependencies)
  const publicItems = items.filter(i=>i.isPublic)
  const examples = publicItems.slice(0, 6)

  // typing animation for hero title
  useEffect(()=>{
    const target = 'Frelsi'
    let i = 0
    setTypedTitle('')
    const id = setInterval(()=>{
      i++
      setTypedTitle(target.slice(0,i))
      if(i >= target.length) clearInterval(id)
    }, 160)
    return ()=>clearInterval(id)
  }, [])

  // Scroll-triggered animations
  useEffect(()=>{
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe all cards and sections
    const cards = document.querySelectorAll('.example-card, .gallery-item, .examples, .discover-section')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [discoverMode, publicItems])

  function ensureSafeNavigation(next){
    // if an editor is open and dirty, try to prompt via ref
    const ed = editorRef.current
    const dirty = ed && typeof ed.isDirty === 'function' ? ed.isDirty() : false
    if(editor.open && dirty){
      setNavConfirm({ show:true, onContinue: next })
      return
    }
    next()
  }

  // Admin actions
  function handleAdminButtonClick(){
    setShowAdminLogin(true)
  }
  function handleAdminLogin(username, password){
    // Simple hardcoded check (will be replaced by backend later)
    // For now: username="admin", password="admin123"
    if(username === 'admin' && password === 'admin123'){
      setAdminAuthenticated(true)
      setShowAdminLogin(false)
      setAdminMode(true)
    } else {
      alert('Invalid credentials')
    }
  }
  function handleAdminLogout(){
    setAdminAuthenticated(false)
    setAdminMode(false)
  }
  function addItem(type){
    setEditor({ open:true, type, item: null })
  }
  function editItem(item){
    setEditor({ open:true, type: item.type, item })
  }
  function togglePublic(id){
    setItems(items.map(it => it.id === id ? { ...it, isPublic: !it.isPublic } : it))
  }
  function upsertNotebook(payload){
    // map NewEditor payload to our item shape
    const itemPatch = {
      type:'notebook',
      title: payload.title,
      bodyHtml: payload.excerpt,
      createdAt: payload.date || Date.now(),
      isPublic: (editor.item?.isPublic) ?? false,
    }
    if(payload.id){
      setItems(items.map(it => it.id === payload.id ? { ...it, ...itemPatch } : it))
    } else {
      const id = Math.max(0, ...items.map(i=>i.id||0)) + 1
      setItems([{ id, ...itemPatch }, ...items])
    }
    setEditor({ open:false, type:null, item:null })
  }
  function upsertDrawing(patch){
    const base = {
      type:'drawing',
      title: patch.title || 'Untitled drawing',
      imageUrl: patch.imageUrl || '',
      createdAt: editor.item?.createdAt || Date.now(),
      isPublic: editor.item?.isPublic ?? false,
    }
    if(editor.item?.id){
      setItems(items.map(it => it.id === editor.item.id ? { ...it, ...base } : it))
    } else {
      const id = Math.max(0, ...items.map(i=>i.id||0)) + 1
      setItems([{ id, ...base }, ...items])
    }
    setEditor({ open:false, type:null, item:null })
  }
  function upsertIdea(patch){
    const base = {
      type:'idea',
      title: patch.title || 'Untitled idea',
      text: patch.text || '',
      createdAt: editor.item?.createdAt || Date.now(),
      isPublic: editor.item?.isPublic ?? false,
    }
    if(editor.item?.id){
      setItems(items.map(it => it.id === editor.item.id ? { ...it, ...base } : it))
    } else {
      const id = Math.max(0, ...items.map(i=>i.id||0)) + 1
      setItems([{ id, ...base }, ...items])
    }
    setEditor({ open:false, type:null, item:null })
  }

  // Editor body chooser
  function renderEditor(){
    if(!editor.open) return null
    if(editor.type === 'notebook'){
      const initial = editor.item ? {
        id: editor.item.id,
        title: editor.item.title,
        createdAt: editor.item.createdAt,
        excerpt: editor.item.bodyHtml,
        date: editor.item.createdAt,
      } : undefined
      return (
        <div className="modal-backdrop" onClick={()=>ensureSafeNavigation(()=>setEditor({open:false,type:null,item:null}))}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>{editor.item ? 'Edit notebook' : 'New notebook'}</h3></div>
            <div className="modal-body">
              <NewEditor ref={editorRef} initialData={initial} onCancel={()=>ensureSafeNavigation(()=>setEditor({open:false,type:null,item:null}))} onSaveInitial={upsertNotebook} />
            </div>
          </div>
        </div>
      )
    }
    if(editor.type === 'drawing'){
      return (
        <div className="modal-backdrop" onClick={()=>setEditor({open:false,type:null,item:null})}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>{editor.item ? 'Edit drawing' : 'New drawing'}</h3></div>
            <div className="modal-body">
              <AdminPanel.DrawingEditor initial={editor.item} onCancel={()=>setEditor({open:false,type:null,item:null})} onSave={upsertDrawing} />
            </div>
          </div>
        </div>
      )
    }
    if(editor.type === 'idea'){
      return (
        <div className="modal-backdrop" onClick={()=>setEditor({open:false,type:null,item:null})}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>{editor.item ? 'Edit idea' : 'New idea'}</h3></div>
            <div className="modal-body">
              <AdminPanel.IdeaEditor initial={editor.item} onCancel={()=>setEditor({open:false,type:null,item:null})} onSave={upsertIdea} />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Discover list with filters
  function DiscoverList(){
    const list = publicItems.filter(it => {
      if(filter.type && it.type !== filter.type) return false
      if(filter.q){
        const blob = `${it.title} ${it.type} ${it.text||''} ${it.bodyHtml||''}`.toLowerCase()
        if(!blob.includes(filter.q.toLowerCase())) return false
      }
      return true
    })
    return (
      <section className="discover-section">
        <div className="discover-header">
          <h2 className="section-title">Discover</h2>
          <p className="discover-subtitle">Explore tous mes contenus publics</p>
        </div>
        <div className="discover-controls">
          <div className="filter-group">
            <label className="filter-label">Type</label>
            <select className="filter-select" value={filter.type} onChange={e=>setFilter(s=>({...s,type:e.target.value}))}>
              <option value="">Tous</option>
              <option value="notebook">📓 Notebook</option>
              <option value="idea">💡 Idea</option>
              <option value="drawing">🎨 Drawing</option>
            </select>
          </div>
          <div className="filter-group filter-search">
            <label className="filter-label">Recherche</label>
            <input className="filter-input" placeholder="Mots-clés..." value={filter.q} onChange={e=>setFilter(s=>({...s,q:e.target.value}))} />
          </div>
          <div className="filter-results">
            <span className="results-badge">{list.length}</span>
            <span className="results-text">{list.length > 1 ? 'résultats' : 'résultat'}</span>
          </div>
        </div>
        <div className="gallery-grid">
          {list.map((item, idx)=> (
            <div key={item.id} className="gallery-item" style={{animationDelay: `${idx*90}ms`}}>
              <PublicItemCard item={item} onOpen={(it)=>setShowReadConfirm(it)} />
            </div>
          ))}
          {list.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">Aucun résultat pour ces filtres</div>
              <button className="btn" onClick={()=>setFilter({type:'',q:''})}>Réinitialiser</button>
            </div>
          )}
        </div>
      </section>
    )
  }

  function Doodles(){
    return (
      <>
        {/* Left side creative doodles */}
        <svg className="doodle doodle-left doodle-1" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Flowing organic line */}
          <path d="M40 50 Q 80 80, 60 120 T 40 180 Q 20 220, 60 260 T 40 320" stroke="#deb7a6" strokeWidth="4" fill="none" strokeLinecap="round"/>
          {/* Abstract shapes */}
          <circle cx="70" cy="100" r="8" fill="#b57b6b" opacity="0.7"/>
          <circle cx="50" cy="240" r="12" fill="#caa291" opacity="0.5"/>
          <rect x="30" y="160" width="15" height="15" fill="#e4c5b9" opacity="0.6" transform="rotate(45 37.5 167.5)"/>
          {/* Dots cluster */}
          <circle cx="85" cy="200" r="3" fill="#b57b6b"/>
          <circle cx="95" cy="205" r="3" fill="#b57b6b"/>
          <circle cx="90" cy="215" r="3" fill="#b57b6b"/>
          {/* Curved accent */}
          <path d="M20 300 Q 50 290, 45 310" stroke="#c18a75" strokeWidth="3" fill="none"/>
        </svg>

        {/* Top right artistic doodle */}
        <svg className="doodle doodle-right doodle-2" viewBox="0 0 250 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Spiral-like path */}
          <path d="M120 20 Q 160 40, 140 80 Q 100 100, 120 140 Q 150 170, 120 200" stroke="#c18a75" strokeWidth="4" fill="none" strokeLinecap="round"/>
          {/* Geometric accents */}
          <polygon points="180,60 190,75 180,90 170,75" fill="#deb7a6" opacity="0.7"/>
          <circle cx="200" cy="130" r="10" fill="#b57b6b" opacity="0.6"/>
          {/* Stars */}
          <path d="M160 180 l3 9 l9 1 l-7 6 l2 9 l-7-5 l-7 5 l2-9 l-7-6 l9-1 z" fill="#e4c5b9" opacity="0.8"/>
          {/* Wavy line */}
          <path d="M140 240 Q 160 230, 180 240 T 220 240" stroke="#caa291" strokeWidth="3" fill="none"/>
        </svg>

        {/* Bottom left playful doodle */}
        <svg className="doodle doodle-left doodle-3" viewBox="0 0 180 350" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Organic blob shape */}
          <path d="M50 50 Q 90 30, 110 60 Q 120 100, 90 120 Q 50 130, 40 100 Q 20 70, 50 50 Z" fill="#e4c5b9" opacity="0.4"/>
          {/* Connecting curves */}
          <path d="M70 150 Q 100 140, 90 170 Q 80 200, 110 210" stroke="#b57b6b" strokeWidth="3" fill="none" strokeDasharray="5,5"/>
          {/* Abstract eye-like shape */}
          <ellipse cx="65" cy="250" rx="20" ry="12" fill="none" stroke="#caa291" strokeWidth="2"/>
          <circle cx="65" cy="250" r="4" fill="#b57b6b"/>
          {/* Small accents */}
          <line x1="30" y1="300" x2="50" y2="310" stroke="#deb7a6" strokeWidth="3" strokeLinecap="round"/>
          <line x1="40" y1="320" x2="60" y2="315" stroke="#c18a75" strokeWidth="3" strokeLinecap="round"/>
        </svg>

        {/* Bottom right modern doodle */}
        <svg className="doodle doodle-right doodle-4" viewBox="0 0 220 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Abstract face concept */}
          <circle cx="110" cy="80" r="35" fill="none" stroke="#deb7a6" strokeWidth="3"/>
          <circle cx="100" cy="75" r="4" fill="#b57b6b"/>
          <circle cx="120" cy="75" r="4" fill="#b57b6b"/>
          <path d="M100 90 Q 110 95, 120 90" stroke="#b57b6b" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* Flowing energy lines */}
          <path d="M150 150 Q 180 160, 170 190 Q 160 220, 185 240" stroke="#c18a75" strokeWidth="3" fill="none" opacity="0.7"/>
          <path d="M140 180 Q 160 185, 155 205" stroke="#caa291" strokeWidth="2" fill="none"/>
          {/* Decorative elements */}
          <circle cx="190" cy="280" r="6" fill="#e4c5b9" opacity="0.8"/>
          <circle cx="175" cy="300" r="4" fill="#deb7a6" opacity="0.7"/>
          <circle cx="195" cy="310" r="5" fill="#b57b6b" opacity="0.6"/>
          {/* Arrow-like accent */}
          <path d="M160 340 L170 350 L160 360" stroke="#c18a75" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* Doodle 5 - Playful stars */}
        <svg className="doodle doodle-5" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M60 10 l8 25 l26 2 l-20 18 l6 26 l-20-14 l-20 14 l6-26 l-20-18 l26-2 z" fill="#e4c5b9" opacity="0.6"/>
          <circle cx="30" cy="90" r="5" fill="#deb7a6" opacity="0.7"/>
          <circle cx="90" cy="30" r="4" fill="#caa291" opacity="0.6"/>
        </svg>

        {/* Doodle 6 - Geometric patterns */}
        <svg className="doodle doodle-6" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="30" y="30" width="80" height="80" fill="none" stroke="#b57b6b" strokeWidth="3" rx="10"/>
          <circle cx="70" cy="70" r="20" fill="#e4c5b9" opacity="0.5"/>
          <path d="M50 50 L90 90 M90 50 L50 90" stroke="#deb7a6" strokeWidth="2" opacity="0.7"/>
        </svg>

        {/* Doodle 7 - Flowing ribbons */}
        <svg className="doodle doodle-7" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 80 Q 40 40, 80 60 T 140 80 Q 120 120, 80 100 T 20 80" stroke="#c18a75" strokeWidth="4" fill="none" opacity="0.7"/>
          <circle cx="50" cy="60" r="6" fill="#deb7a6" opacity="0.6"/>
          <circle cx="110" cy="100" r="6" fill="#caa291" opacity="0.6"/>
        </svg>

        {/* Doodle 8 - Abstract nature */}
        <svg className="doodle doodle-8" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M65 20 Q 50 40, 65 60 Q 80 80, 65 100" stroke="#b57b6b" strokeWidth="3" fill="none"/>
          <circle cx="40" cy="50" r="8" fill="#e4c5b9" opacity="0.6"/>
          <circle cx="90" cy="80" r="8" fill="#deb7a6" opacity="0.6"/>
          <path d="M30 90 Q 65 85, 100 90" stroke="#caa291" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
        </svg>
      </>
    )
  }

  function Hero(){
    return (
      <section className="hero">
        <div className="hero-inner">
          <h1 className="logo-script">
            <span className="typewriter">{typedTitle}<span className="cursor">|</span></span>
          </h1>
          <p className="hero-tagline">Un lieu simple et attachant où je dépose mes pensées, idées, potentiels débats, notebooks et petits dessins.</p>
        </div>
      </section>
    )
  }

  function NavBar(){
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <button 
            className={`nav-btn ${!discoverMode ? 'active' : ''}`} 
            onClick={()=>setDiscoverMode(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>
          <button 
            className={`nav-btn ${discoverMode ? 'active' : ''}`} 
            onClick={()=>setDiscoverMode(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Discover
          </button>
        </div>
      </nav>
    )
  }

  function Examples(){
    return (
      <section className="examples">
        <Doodles />
        <h2 className="section-title">Exemples</h2>
        <div className="examples-grid">
          {examples.map((item, idx)=> (
            <div key={item.id} className="example-card" style={{animationDelay: `${idx*120}ms`}}>
              <PublicItemCard item={item} onOpen={(it)=>setShowReadConfirm(it)} />
            </div>
          ))}
          {examples.length === 0 && (
            <div className="muted">Aucun exemple public pour le moment. Passe en mode Admin pour en ajouter.</div>
          )}
        </div>
        <div style={{textAlign:'center',marginTop:12}}>
          <button className="btn accent" onClick={()=>setDiscoverMode(true)}>Discover</button>
        </div>
      </section>
    )
  }

  return (
    <div>
      {!discoverMode && <Hero />}
      
      <NavBar />

      {!discoverMode && <Examples />}
      {discoverMode && <DiscoverList />}

      {adminMode && (
        <AdminPanel
          items={items}
          onClose={()=>setAdminMode(false)}
          onLogout={handleAdminLogout}
          onAdd={addItem}
          onEdit={editItem}
          onTogglePublic={togglePublic}
        />
      )}

      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin} 
          onClose={()=>setShowAdminLogin(false)} 
        />
      )}

      {showReadConfirm && (
        <div className="modal-backdrop" onClick={()=>setShowReadConfirm(null)}>
          <div className="modal read-confirm-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <h3>Lire en détail ?</h3>
            </div>
            <div className="modal-body">
              <p>Voulez-vous lire <strong>{showReadConfirm.title}</strong> en mode lecture complète ?</p>
              <div className="read-confirm-type">
                Type: <span className="type-badge">{showReadConfirm.type === 'notebook' ? '📓 Notebook' : showReadConfirm.type === 'idea' ? '💡 Idea' : '🎨 Drawing'}</span>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
                <button className="btn" onClick={()=>setShowReadConfirm(null)}>Annuler</button>
                <button className="btn primary" onClick={()=>{setReadingItem(showReadConfirm); setShowReadConfirm(null)}}>Oui, lire</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {readingItem && (
        <ReadingView item={readingItem} onClose={()=>setReadingItem(null)} />
      )}

      {renderEditor()}

      {navConfirm.show && (
        <div className="modal-backdrop" onClick={()=>setNavConfirm({show:false,onContinue:null})}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><h3>Unsaved changes</h3></div>
            <div className="modal-body">
              <p>Do you want to save your note before leaving?</p>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                <button className="btn" onClick={()=>setNavConfirm({show:false,onContinue:null})}>Cancel</button>
                <button className="btn" onClick={()=>{ setNavConfirm({show:false,onContinue:null}); editorRef.current?.save?.(); }}>Save</button>
                <button className="btn primary" onClick={()=>{ const cont = navConfirm.onContinue; setNavConfirm({show:false,onContinue:null}); cont && cont(); }}>Discard and continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {import.meta.env.DEV && errors.length > 0 && (
        <div style={{position:'fixed',left:12,top:12,background:'rgba(255,0,0,0.9)',color:'#fff',padding:'8px 10px',borderRadius:6,zIndex:9999,fontSize:12,maxWidth:420}}>
          <div style={{fontWeight:700}}>Runtime Errors ({errors.length})</div>
          {errors.slice(-5).reverse().map((e, i)=> (
            <div key={i} style={{marginTop:6}}>
              <div style={{fontWeight:600}}>{e.msg}</div>
              {e.stack && <div style={{fontSize:11,opacity:0.9,whiteSpace:'pre-wrap',maxHeight:120,overflow:'auto'}}>{e.stack}</div>}
            </div>
          ))}
        </div>
      )}

      <Footer onAdmin={handleAdminButtonClick} />
    </div>
  )
}

// Admin Login Component
function AdminLogin({ onLogin, onClose }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  function handleSubmit(e){
    e.preventDefault()
    onLogin(username, password)
  }
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal admin-login-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>Admin Authentication</h3>
          <button className="btn ghost small" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="stack">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              placeholder="Enter username"
              autoFocus
            />
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Enter password"
            />
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn primary">Login</button>
            </div>
          </form>
          <div className="hint" style={{marginTop:12,fontSize:12}}>
            <strong>Demo credentials:</strong> username: <code>admin</code> / password: <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reading View Component (A4 paper style)
function ReadingView({ item, onClose }){
  return (
    <div className="reading-backdrop" onClick={onClose}>
      <div className="reading-container" onClick={e=>e.stopPropagation()}>
        <div className="reading-header">
          <button className="btn-back" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour
          </button>
          <div className="reading-title-group">
            <h1 className="reading-title">{item.title}</h1>
            <div className="reading-meta">
              <span className="type-badge">
                {item.type === 'notebook' ? '📓 Notebook' : item.type === 'idea' ? '💡 Idea' : '🎨 Drawing'}
              </span>
              <span className="reading-date">{new Date(item.createdAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'})}</span>
            </div>
          </div>
        </div>
        
        <div className="reading-paper">
          <div className="paper-content">
            {item.type === 'notebook' && (
              <div className="notebook-content" dangerouslySetInnerHTML={{ __html: item.bodyHtml }} />
            )}
            {item.type === 'idea' && (
              <div className="idea-content">
                <p>{item.text}</p>
              </div>
            )}
            {item.type === 'drawing' && item.imageUrl && (
              <div className="drawing-content">
                <img src={item.imageUrl} alt={item.title} style={{maxWidth:'100%',borderRadius:8}} />
              </div>
            )}
            {item.type === 'drawing' && !item.imageUrl && (
              <div className="empty-drawing">
                <div className="empty-icon">🎨</div>
                <p>Aucune image disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
