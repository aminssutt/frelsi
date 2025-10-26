import React, { useState, useRef, useEffect } from 'react'
import NewEditor from './pages/NewEditor'
import Footer from './components/Footer'
import AdminPanel from './components/AdminPanel'
import Doodles from './components/Doodles'
import EmailLogin from './components/EmailLogin'
import * as api from './services/api'

// Public card for items
function PublicItemCard({ item, onOpen, onLike }){
  const [likeCount, setLikeCount] = useState(item.likes_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const authorName = item.author === 'amar' ? 'Amar Berache' : 'Lakhdar Berache'
  
  const handleLike = async (e) => {
    e.stopPropagation() // Empêcher l'ouverture de la carte
    if(isLiking) return
    
    setIsLiking(true)
    try {
      const result = await api.likeItem(item.id)
      setLikeCount(result.likes_count)
      if(onLike) onLike(item.id, result.likes_count)
    } catch(err) {
      console.error('Failed to like item:', err)
    } finally {
      setIsLiking(false)
    }
  }
  
  return (
    <article className="card" onClick={()=>onOpen?.(item)} style={{cursor:'pointer'}}>
      <div className="card-left" />
      <div className="card-body">
        <div className="card-meta">
          {item.type} • {new Date(item.createdAt).toLocaleDateString()}
          {item.author && <span className="author-tag">👤 {authorName}</span>}
        </div>
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
        <div className="card-footer">
          <button 
            className={`like-btn ${isLiking ? 'liking' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
            aria-label="Like"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={likeCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default function App() {
  const [items, setItems] = useState([]) // {id,type,title,createdAt,isPublic,author, bodyHtml|imageUrl|text}
  const [view, setView] = useState('home') // 'home', 'discover', or 'admin'
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null) // 'lakhdar' or 'amar'
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [errors, setErrors] = useState([])
  const [editor, setEditor] = useState({ open:false, type:null, item:null })
  const editorRef = useRef(null)
  const [navConfirm, setNavConfirm] = useState({ show:false, onContinue:null })
  const [filter, setFilter] = useState({ type:'', q:'', author:'' })
  const [typedTitle, setTypedTitle] = useState('')
  const [readingItem, setReadingItem] = useState(null)
  const [showReadConfirm, setShowReadConfirm] = useState(null)
  const [loadingData, setLoadingData] = useState(true) // Track initial data loading

  // Load items from API on mount only
  useEffect(()=>{
    async function loadItems(){
      setLoadingData(true)
      try {
        // Check if we have a valid token by validating it with backend
        const isAuth = api.isAuthenticated() && await api.validateToken()
        
        if(isAuth){
          setAdminAuthenticated(true)
          setCurrentUser(import.meta.env.VITE_ADMIN_EMAIL)
          // Load all items (public + private) if authenticated
          const allItems = await api.getAllItems()
          setItems(allItems)
        } else {
          // Token invalid or doesn't exist - clear auth state
          setAdminAuthenticated(false)
          setCurrentUser(null)
          api.clearAuthToken()
          // Load only public items
          const publicItems = await api.getPublicItems()
          setItems(publicItems)
        }
      } catch(err){
        console.error('Failed to load items from API:', err)
        // On error, assume not authenticated
        setAdminAuthenticated(false)
        setCurrentUser(null)
        api.clearAuthToken()
        // Try to load public items at least
        try {
          const publicItems = await api.getPublicItems()
          setItems(publicItems)
        } catch(e) {
          console.error('Failed to load public items:', e)
        }
      } finally {
        setLoadingData(false)
      }
    }
    
    loadItems()
  }, []) // Removed adminAuthenticated dependency - only load on mount

  // No more localStorage persistence - all changes go through API

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
  const publicItems = items
    .filter(i=>i.isPublic)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
      if(view !== 'home'){
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
  }, [view])

  // Force update intro opacity immediately after any state change
  useEffect(() => {
    // Hide intro completely if not on home page
    if(view !== 'home'){
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
  }, [view, editor.open, showAdminLogin, readingItem, showReadConfirm, items.length])

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
  }, [view, items])

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
  
  async function handleEmailLoginSuccess(){
    // Called by EmailLogin when authentication succeeds
    setAdminAuthenticated(true)
    setCurrentUser(import.meta.env.VITE_ADMIN_EMAIL)
    setShowAdminLogin(false)
    setView('admin')
    
    // Reload all items (including private ones)
    try {
      const allItems = await api.getAllItems()
      setItems(allItems)
    } catch(err){
      console.error('Failed to reload items after login:', err)
    }
  }
  
  async function handleAdminLogout(){
    api.logout()
    setAdminAuthenticated(false)
    setCurrentUser(null)
    setView('home')
    
    // Reload only public items
    try {
      const publicItems = await api.getPublicItems()
      setItems(publicItems)
    } catch(err){
      console.error('Failed to reload items after logout:', err)
    }
  }
  
  // Extract author name from email or use provided author
  function getAuthorName(providedAuthor) {
    if (providedAuthor && ['lakhdar', 'amar'].includes(providedAuthor)) {
      return providedAuthor
    }
    // If currentUser is an email, extract first name
    if (currentUser && currentUser.includes('@')) {
      const name = currentUser.split('@')[0].toLowerCase()
      if (name.includes('lakhdar')) return 'lakhdar'
      if (name.includes('amar')) return 'amar'
    }
    return 'lakhdar' // Default
  }
  
  function addItem(type){
    setEditor({ open:true, type, item: null })
  }
  
  function editItem(item){
    setEditor({ open:true, type: item.type, item })
  }
  
  async function togglePublic(id){
    try {
      const updatedItem = await api.toggleItemPublic(id)
      setItems(items.map(it => it.id === id ? updatedItem : it))
    } catch(err){
      console.error('Failed to toggle public status:', err)
      alert('Échec de la mise à jour du statut public')
    }
  }
  
  async function upsertNotebook(payload){
    // map NewEditor payload to our item shape
    const itemData = {
      type:'notebook',
      title: payload.title,
      bodyHtml: payload.excerpt,
      createdAt: payload.date || Date.now(),
      isPublic: (editor.item?.isPublic) ?? false,
      author: getAuthorName(payload.author || editor.item?.author),
    }
    
    try {
      if(payload.id){
        // Update existing
        const updated = await api.updateItem(payload.id, itemData)
        setItems(items.map(it => it.id === payload.id ? updated : it))
      } else {
        // Create new
        const created = await api.createItem(itemData)
        setItems([created, ...items])
      }
      setEditor({ open:false, type:null, item:null })
    } catch(err){
      console.error('Failed to save notebook:', err)
      alert('Échec de la sauvegarde du notebook')
    }
  }
  
  async function upsertDrawing(patch){
    const itemData = {
      type:'drawing',
      title: patch.title,
      imageUrl: patch.imageUrl || editor.item?.imageUrl || '',
      createdAt: patch.createdAt || editor.item?.createdAt || Date.now(),
      isPublic: patch.isPublic ?? editor.item?.isPublic ?? false,
      author: getAuthorName(patch.author || editor.item?.author),
    }
    
    try {
      if(editor.item?.id){
        // Update existing
        const updated = await api.updateItem(editor.item.id, itemData)
        setItems(items.map(it => it.id === editor.item.id ? updated : it))
      } else {
        // Create new
        const created = await api.createItem(itemData)
        setItems([created, ...items])
      }
      setEditor({ open:false, type:null, item:null })
    } catch(err){
      console.error('Failed to save drawing:', err)
      alert('Échec de la sauvegarde du dessin')
    }
  }
  
  async function upsertIdea(patch){
    const itemData = {
      type:'idea',
      title: patch.title,
      text: patch.text || editor.item?.text || '',
      createdAt: patch.createdAt || editor.item?.createdAt || Date.now(),
      isPublic: patch.isPublic ?? editor.item?.isPublic ?? false,
      author: getAuthorName(patch.author || editor.item?.author),
    }
    
    try {
      if(editor.item?.id){
        // Update existing
        const updated = await api.updateItem(editor.item.id, itemData)
        setItems(items.map(it => it.id === editor.item.id ? updated : it))
      } else {
        // Create new
        const created = await api.createItem(itemData)
        setItems([created, ...items])
      }
      setEditor({ open:false, type:null, item:null })
    } catch(err){
      console.error('Failed to save idea:', err)
      alert('Échec de la sauvegarde de l\'idée')
    }
  }
  
  async function deleteItemById(id){
    if(!window.confirm('Supprimer définitivement cet élément ?')) return
    
    try {
      await api.deleteItem(id)
      setItems(items.filter(it => it.id !== id))
    } catch(err){
      console.error('Failed to delete item:', err)
      alert('Échec de la suppression')
    }
  }

  function closeEditor(){
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
      if(filter.author && it.author !== filter.author) return false
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
          <div className="filter-group">
            <label className="filter-label">Auteur</label>
            <select className="filter-select" value={filter.author} onChange={e=>setFilter(s=>({...s,author:e.target.value}))}>
              <option value="">Tous</option>
              <option value="lakhdar">👤 Lakhdar</option>
              <option value="amar">👤 Amar</option>
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
          {loadingData ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div className="loading-text">Chargement du contenu...</div>
              <div className="loading-subtext">Préparation de vos découvertes ✨</div>
            </div>
          ) : (
            <>
              {list.map((item, idx)=> (
                <div key={item.id} className="gallery-item" style={{animationDelay: `${idx*90}ms`}}>
                  <PublicItemCard item={item} onOpen={(it)=>setShowReadConfirm(it)} />
                </div>
              ))}
              {list.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-text">Aucun résultat pour ces filtres</div>
                  <button className="btn" onClick={()=>setFilter({type:'',q:'',author:''})}>Réinitialiser</button>
                </div>
              )}
            </>
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
            className={`nav-btn ${view === 'home' ? 'active' : ''}`} 
            onClick={()=>setView('home')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>
          <button 
            className={`nav-btn ${view === 'discover' ? 'active' : ''}`} 
            onClick={()=>setView('discover')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Discover
          </button>
          {adminAuthenticated && (
            <button 
              className={`nav-btn ${view === 'admin' ? 'active' : ''}`} 
              onClick={()=>setView('admin')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 5 0 1 1 10 0v4"/>
              </svg>
              Admin
            </button>
          )}
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
          {loadingData ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div className="loading-text">Chargement des notebooks...</div>
              <div className="loading-subtext">On y est presque ✨</div>
            </div>
          ) : (
            <>
              {examples.map((item, idx)=> (
                <div key={item.id} className="example-card" style={{animationDelay: `${idx*120}ms`}}>
                  <PublicItemCard item={item} onOpen={(it)=>setShowReadConfirm(it)} />
                </div>
              ))}
              {examples.length === 0 && (
                <div className="muted">Aucun exemple public pour le moment. Passe en mode Admin pour en ajouter.</div>
              )}
            </>
          )}
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
      
      <div className={`main-content ${view !== 'home' ? 'no-intro' : ''}`}>
        {view === 'home' && <Hero />}
        
        <NavBar />

        {view === 'home' && <Examples />}
        {view === 'discover' && <DiscoverList />}

      {view === 'admin' && (
        <AdminPanel
          items={items}
          onClose={()=>setView('home')}
          onLogout={handleAdminLogout}
          onAdd={addItem}
          onEdit={editItem}
          onTogglePublic={togglePublic}
        />
      )}

      {showAdminLogin && (
        <EmailLogin 
          onSuccess={handleEmailLoginSuccess} 
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

// Reading View Component (A4 paper style)
function ReadingView({ item, onClose }){
  const authorName = item.author === 'amar' ? 'Amar Berache' : 'Lakhdar Berache'
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
              {item.author && <span className="author-badge">👤 {authorName}</span>}
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
