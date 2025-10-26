import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'

function Toolbar({ onCommand }){
  return (
    <div className="editor-toolbar">
      <button onClick={()=>onCommand('bold')} title="Gras"><strong>B</strong></button>
      <button onClick={()=>onCommand('italic')} title="Italique"><em>I</em></button>
      <button onClick={()=>onCommand('underline')} title="Souligné"><u>U</u></button>
      <button onClick={()=>onCommand('strikeThrough')} title="Barré"><s>S</s></button>
      <span className="toolbar-separator">|</span>
      <button onClick={()=>onCommand('h1')} title="Titre 1">H1</button>
      <button onClick={()=>onCommand('h2')} title="Titre 2">H2</button>
      <button onClick={()=>onCommand('h3')} title="Titre 3">H3</button>
      <button onClick={()=>onCommand('h4')} title="Titre 4">H4</button>
      <span className="toolbar-separator">|</span>
      <button onClick={()=>onCommand('insertUnorderedList')} title="Liste à puces">• Liste</button>
      <button onClick={()=>onCommand('insertOrderedList')} title="Liste numérotée">1. Liste</button>
      <span className="toolbar-separator">|</span>
      <button onClick={()=>onCommand('hiliteYellow')} title="Surlignage jaune" style={{background:'#fff59d'}}>⬛</button>
      <button onClick={()=>onCommand('hiliteGreen')} title="Surlignage vert" style={{background:'#c5e1a5'}}>⬛</button>
      <button onClick={()=>onCommand('hilitePink')} title="Surlignage rose" style={{background:'#f8bbd0'}}>⬛</button>
      <button onClick={()=>onCommand('removeFormat')} title="Supprimer le formatage">✖</button>
      <span className="toolbar-separator">|</span>
      <button onClick={()=>onCommand('insertImage')} title="Insérer une image">🖼️ Image</button>
      <button onClick={()=>onCommand('draw')} title="Dessiner">✏️ Draw</button>
    </div>
  )
}

function ConfirmPopup({ text, onConfirm, onCancel }){
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{width:320}}>
        <div className="modal-head"><h3>Confirm</h3></div>
        <div className="modal-body">
          <p>{text}</p>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
            <button className="btn" onClick={onCancel}>Cancel</button>
            <button className="btn primary" onClick={onConfirm}>Yes, draw</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const NewEditor = forwardRef(function NewEditor({ onCancel, onSaveInitial, initialData }, ref){
  const editorRef = useRef(null)
  const overlayRef = useRef(null)
  const canvasRef = useRef(null)
  const [title, setTitle] = useState(initialData?.title || '')
  const [author, setAuthor] = useState(initialData?.author || 'lakhdar')
  const [date, setDate] = useState(initialData ? new Date(initialData.date || initialData.createdAt).toISOString().slice(0,10) : new Date().toISOString().slice(0,10))
  const [themes, setThemes] = useState(initialData?.themes || [])
  const [themeInput, setThemeInput] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [drawingMode, setDrawingMode] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPos = useRef({x:0,y:0})
  const [dirty, setDirty] = useState(false)
  const initialSnapshot = useRef({
    title: initialData?.title || '',
    author: initialData?.author || 'lakhdar',
    date: initialData ? new Date(initialData.date || initialData.createdAt).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
    themes: initialData?.themes ? JSON.stringify(initialData.themes) : JSON.stringify([]),
    content: initialData?.excerpt || ''
  })

  useEffect(()=>{
    // make sure overlay container exists inside editor-body
    const overlay = overlayRef.current
    if(overlay){ overlay.style.position = 'absolute'; overlay.style.inset = '0'; overlay.style.pointerEvents = 'none' }
    // if initial data contains HTML with absolute images, render them into overlay
    if(initialData && initialData.excerpt){
      const parser = new DOMParser()
      const doc = parser.parseFromString(initialData.excerpt, 'text/html')
      const imgs = doc.querySelectorAll('img')
      imgs.forEach(img => {
        const src = img.getAttribute('src')
        const style = img.getAttribute('style') || ''
        // try to parse left/top from style
        const leftMatch = /left:\s*([0-9.]+)px/.exec(style)
        const topMatch = /top:\s*([0-9.]+)px/.exec(style)
        const left = leftMatch ? parseFloat(leftMatch[1]) : 20
        const top = topMatch ? parseFloat(topMatch[1]) : 20
        // create floating image
        createFloatingImageAt(src, left, top)
      })
      // set editor innerHTML to the content portion (remove floated imgs)
      const contentOnly = doc.body.innerHTML
      if(editorRef.current){ editorRef.current.innerHTML = contentOnly }
    }
  }, [])

  // dirty tracker
  useEffect(()=>{
    const interval = setInterval(()=>{
      const cur = {
        title,
        date,
        themes: JSON.stringify(themes),
        content: editorRef.current ? editorRef.current.innerHTML : ''
      }
      const initial = initialSnapshot.current
      const isDirty = cur.title !== initial.title || cur.date !== initial.date || cur.themes !== initial.themes || cur.content !== initial.content
      setDirty(isDirty)
    }, 400)
    return ()=>clearInterval(interval)
  }, [title, date, themes])

  useImperativeHandle(ref, ()=>({
    async save(){
      // call submit and return payload
      const content = editorRef.current ? editorRef.current.innerHTML : ''
      const wrapper = `<div style=\"position:relative;min-height:200px;\">${content}</div>`
      const payload = { title, author, date: new Date(date).getTime(), themes, excerpt: wrapper }
      if(initialData && initialData.id) payload.id = initialData.id
      onSaveInitial(payload)
      // update snapshot
      initialSnapshot.current = { title, author, date, themes: JSON.stringify(themes), content }
      setDirty(false)
      return payload
    },
    isDirty(){ return dirty }
  }))

  function exec(cmd){
    if(cmd === 'h1') document.execCommand('formatBlock', false, 'h1')
    else if(cmd === 'h2') document.execCommand('formatBlock', false, 'h2')
    else if(cmd === 'h3') document.execCommand('formatBlock', false, 'h3')
    else if(cmd === 'h4') document.execCommand('formatBlock', false, 'h4')
    else if(cmd === 'hiliteYellow'){
      document.execCommand('hiliteColor', false, '#fff59d')
    }
    else if(cmd === 'hiliteGreen'){
      document.execCommand('hiliteColor', false, '#c5e1a5')
    }
    else if(cmd === 'hilitePink'){
      document.execCommand('hiliteColor', false, '#f8bbd0')
    }
    else if(cmd === 'insertImage'){
      const url = prompt('Image URL')
      if(url) insertFloatingImage(url)
    }
    else if(cmd === 'draw'){
      setShowConfirm(true)
    }
    else document.execCommand(cmd)
  }

  function addTheme(){
    const t = themeInput.trim()
    if(!t) return
    setThemes([...themes, t])
    setThemeInput('')
  }

  function startDrawing(){
    setShowConfirm(false)
    setDrawingMode(true)
    // size canvas to editor
    const editor = editorRef.current
    const canvas = canvasRef.current
    const rect = editor.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    canvas.style.position = 'absolute'
    canvas.style.left = rect.left + 'px'
    canvas.style.top = rect.top + 'px'
    canvas.style.pointerEvents = 'auto'
    canvas.style.zIndex = 80
    canvas.style.background = 'transparent'
  }

  function stopDrawing(){
    setDrawingMode(false)
  }

  function onCanvasPointerDown(e){
    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onCanvasPointerMove(e){
    if(!isDrawing) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.strokeStyle = '#3b2f2a'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onCanvasPointerUp(e){
    setIsDrawing(false)
  }

  function saveDrawing(){
    const canvas = canvasRef.current
    const data = canvas.toDataURL('image/png')
    // place the image at the last drawing position relative to editor
    createFloatingImageAt(data, lastPos.current.x, lastPos.current.y)
    // clear canvas
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,canvas.width,canvas.height)
    stopDrawing()
  }

  function cancelDrawing(){
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,canvas.width,canvas.height)
    stopDrawing()
  }

  function createFloatingImageAt(src, x, y){
    const container = overlayRef.current
    const img = document.createElement('img')
    img.src = src
    img.className = 'floating-img'
    img.style.position = 'absolute'
    img.style.left = x + 'px'
    img.style.top = y + 'px'
    img.style.width = '220px'
    img.style.cursor = 'grab'
    img.style.pointerEvents = 'auto'

    // dragging
    let dragging = false
    let offset = {x:0,y:0}
    img.onpointerdown = (ev) => {
      dragging = true
      img.setPointerCapture(ev.pointerId)
      const rect = img.getBoundingClientRect()
      offset.x = ev.clientX - rect.left
      offset.y = ev.clientY - rect.top
      img.style.cursor = 'grabbing'
    }
    img.onpointermove = (ev) => {
      if(!dragging) return
      const parentRect = overlayRef.current.getBoundingClientRect()
      const nx = ev.clientX - parentRect.left - offset.x
      const ny = ev.clientY - parentRect.top - offset.y
      img.style.left = nx + 'px'
      img.style.top = ny + 'px'
    }
    img.onpointerup = (ev) => {
      dragging = false
      try{ img.releasePointerCapture(ev.pointerId) }catch(e){}
      img.style.cursor = 'grab'
    }

    container.appendChild(img)
  }

  function insertFloatingImage(url){
    // insert at center of editor overlay
    const editor = editorRef.current
    const rect = editor.getBoundingClientRect()
    const x = rect.width / 2 - 110
    const y = rect.height / 2 - 60
    createFloatingImageAt(url, x, y)
  }

  function submit(){
    // collect overlay images as part of content: we will append overlay images as <img> nodes inside the editor HTML
    const overlay = overlayRef.current
    // clone overlay imgs into editor content as inline <img> with style attributes for position
    const editor = editorRef.current
    const contentHtml = editor.innerHTML
    const imgs = overlay.querySelectorAll('img.floating-img')
    let appended = ''
    imgs.forEach(img => {
      const left = parseFloat(img.style.left || 0)
      const top = parseFloat(img.style.top || 0)
      // include inline style to preserve placement (absolute positioning inside a relatively positioned wrapper)
      appended += `<img src="${img.src}" style="position:absolute;left:${left}px;top:${top}px;width:${img.style.width};" />`
    })
    const wrapper = `<div style=\"position:relative;min-height:200px;\">${contentHtml}${appended}</div>`
    // include id if editing
    const payload = { title, date: new Date(date).getTime(), themes, excerpt: wrapper }
    if(initialData && initialData.id) payload.id = initialData.id
    onSaveInitial(payload)
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={author} onChange={e=>setAuthor(e.target.value)} style={{padding:'8px',borderRadius:'8px',border:'1px solid #e6dcd6'}}>
          <option value="lakhdar">👤 Lakhdar Berache</option>
          <option value="amar">👤 Amar Berache</option>
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <div className="themes-input">
          <input placeholder="Add a theme" value={themeInput} onChange={e=>setThemeInput(e.target.value)} />
          <button className="btn" onClick={addTheme}>Add theme</button>
        </div>
        <div className="themes-list">{themes.map((t,i)=>(<span key={i} className="tag">{t}</span>))}</div>
        <div className="editor-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={submit}>Save</button>
        </div>
      </div>

      <Toolbar onCommand={exec} />

      <div className="editor-body" style={{position:'relative'}}>
        <div ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning={true} />
        <div ref={overlayRef} className="editor-overlay" />
        {/* inline canvas overlay for drawing */}
        <canvas ref={canvasRef} style={{display: drawingMode ? 'block' : 'none', position:'absolute', zIndex:80, left:0, top:0}} onPointerDown={onCanvasPointerDown} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerLeave={onCanvasPointerUp} />

        { drawingMode && (
          <div style={{position:'absolute',right:12,top:12,zIndex:90,display:'flex',gap:8}}>
            <button className="btn" onClick={cancelDrawing}>Cancel</button>
            <button className="btn primary" onClick={saveDrawing}>Finish drawing</button>
          </div>
        )}

      </div>

      { showConfirm && <ConfirmPopup text={'Do you want to draw on your notebook?'} onConfirm={startDrawing} onCancel={()=>setShowConfirm(false)} /> }
    </div>
  )
})

export default NewEditor
