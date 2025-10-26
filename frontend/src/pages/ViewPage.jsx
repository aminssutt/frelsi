import React, { useState, useMemo } from 'react'

function formatDate(ts){
  const d = new Date(ts)
  return d.toLocaleDateString()
}

export default function ViewPage({ notebooks = [], onBack, selected: initialSelected }){
  const [filter, setFilter] = useState({ tag:'', q:'', from:'', to:'' })
  const [selected, setSelected] = useState(initialSelected || null)

  const tags = useMemo(()=> Array.from(new Set(notebooks.map(n=>n.tag))), [notebooks])

  const filtered = notebooks.filter(n => {
    if(filter.tag && n.tag !== filter.tag) return false
    if(filter.q && !(n.title + ' ' + (n.excerpt||'')).toLowerCase().includes(filter.q.toLowerCase())) return false
    if(filter.from && new Date(n.date || n.createdAt) < new Date(filter.from)) return false
    if(filter.to && new Date(n.date || n.createdAt) > new Date(filter.to)) return false
    return true
  })

  function openForPrint(n){
    setSelected(n)
  }

  function doPrint(){
    window.print()
  }

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <button className="btn" onClick={onBack}>Back</button>
        <h2>View notebooks</h2>
      </div>

      <div style={{display:'flex',gap:20}}>
        <aside style={{width:300}}>
          <div style={{display:'grid',gap:8}}>
            <label>Tag</label>
            <select value={filter.tag} onChange={e=>setFilter(s=>({...s, tag:e.target.value}))}>
              <option value=''>All</option>
              {tags.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
            <label>Keywords</label>
            <input value={filter.q} onChange={e=>setFilter(s=>({...s,q:e.target.value}))} placeholder="search..." />
            <label>Date range</label>
            <input type="date" value={filter.from} onChange={e=>setFilter(s=>({...s,from:e.target.value}))} />
            <input type="date" value={filter.to} onChange={e=>setFilter(s=>({...s,to:e.target.value}))} />
          </div>

          <div style={{marginTop:12}}>
            <strong>Notebooks</strong>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
              {filtered.map(n=> (
                <div key={n.id} style={{padding:8,border:'1px solid rgba(0,0,0,0.04)',cursor:'pointer'}} onClick={()=>openForPrint(n)}>
                  <div style={{fontWeight:700}}>{n.title}</div>
                  <div className="muted">{n.tag} • {formatDate(n.date || n.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main style={{flex:1}}>
          {selected ? (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <h3>{selected.title}</h3>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn" onClick={()=>setSelected(null)}>Close</button>
                  <button className="btn primary" onClick={doPrint}>Print / Save PDF</button>
                </div>
              </div>
              <div className="print-area" style={{background:'#fff',padding:24,borderRadius:8}} dangerouslySetInnerHTML={{__html: selected.excerpt}} />
            </div>
          ) : (
            <div className="muted">Select a notebook to preview its content here. Then use Print to save as PDF.</div>
          )}
        </main>
      </div>
    </div>
  )
}
