import React, { useState, useRef, useEffect } from 'react'
import NewEditor from './pages/NewEditor'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import Doodles from './components/Doodles'

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

  // Handle scroll to hide/show intro screen smoothly (only on Home page)
  useEffect(()=>{
    const updateIntroOpacity = () => {
      // Hide intro completely if not on home page
      if(adminMode || discoverMode){
        const introEl = document.querySelector('.intro-screen')
        if(introEl){
          introEl.style.opacity = '0'
          introEl.style.pointerEvents = 'none'
        }
        return
      }

      const scrollY = window.scrollY
      const maxScroll = window.innerHeight * 0.5
      const opacity = Math.max(0, 1 - (scrollY / maxScroll))
      
      const introEl = document.querySelector('.intro-screen')
      if(introEl){
        introEl.style.opacity = String(opacity)
        introEl.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto'
      }
    }

    // IMMEDIATE call to set correct opacity on mount/re-render
    updateIntroOpacity()
    
    window.addEventListener('scroll', updateIntroOpacity, { passive: true })
    return () => window.removeEventListener('scroll', updateIntroOpacity)
  }, [adminMode, discoverMode])

  // Force update intro opacity immediately after any state change
  useEffect(() => {
    // Hide intro completely if not on home page
    if(adminMode || discoverMode){
      const introEl = document.querySelector('.intro-screen')
      if(introEl){
        introEl.style.opacity = '0'
        introEl.style.pointerEvents = 'none'
      }
      return
    }

    const scrollY = window.scrollY
    const maxScroll = window.innerHeight * 0.5
    const opacity = Math.max(0, 1 - (scrollY / maxScroll))
    
    const introEl = document.querySelector('.intro-screen')
    if(introEl){
      introEl.style.opacity = String(opacity)
      introEl.style.pointerEvents = opacity < 0.05 ? 'none' : 'auto'
    }
  }, [adminMode, discoverMode, editor.open, showAdminLogin, readingItem, showReadConfirm, items.length])

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
        <Doodles />
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

  function Hero(){
    return (
      <section className="hero">
        <Doodles />
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

  function IntroScreen(){
    return (
      <div className="intro-screen">
        <div className="intro-gif-bg"></div>
        <div className="intro-content">
          <h1 className="intro-title">
            <span className="typewriter-intro">{typedTitle}<span className="cursor">|</span></span>
          </h1>
          <p className="scroll-hint">Scroll down to explore</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Fixed intro container that never re-renders */}
      <div className="intro-container">
        <IntroScreen />
      </div>
      
      <div className={`main-content ${adminMode || discoverMode ? 'no-intro' : ''}`}>
        {!adminMode && !discoverMode && <Hero />}
        
        <NavBar />

        {!adminMode && !discoverMode && <Examples />}
        {!adminMode && discoverMode && <DiscoverList />}

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

      </div> {/* End of paddingTop wrapper */}

      <Footer onAdmin={handleAdminButtonClick} />
    </div>
  )
}

// Admin Login Component
function AdminLogin({ onLogin, onClose }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!username || !password){
      setError('Please enter both username and password')
      return
    }
    onLogin(username, password)
  }
  
  return (
    <div className="admin-login-backdrop" onClick={onClose}>
      <div className="admin-login-card" onClick={e=>e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div className="login-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 13c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/>
          </svg>
        </div>
        
        <h2 className="login-title">Admin Access</h2>
        <p className="login-subtitle">Enter your credentials to continue</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={e=>{setUsername(e.target.value); setError('')}}
              placeholder="admin"
              autoFocus
              className="login-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e=>{setPassword(e.target.value); setError('')}}
              placeholder="••••••••"
              className="login-input"
            />
          </div>
          
          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn primary login-submit">
            Sign In
          </button>
          
          <div className="login-demo-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Demo: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </form>
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
