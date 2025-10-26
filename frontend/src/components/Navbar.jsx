import React from 'react'

export default function Navbar({ onLogout, onNew, onUpdate, onView, onGenerate }){
  return (
    <div className="navbar">
      <div className="brand-small">Frelsi</div>
      <div className="nav-actions">
        <button className="btn" onClick={onNew}>New</button>
        <button className="btn" onClick={onUpdate}>Update</button>
        <button className="btn" onClick={onView}>View</button>
        <button className="btn accent" onClick={onGenerate}>Generate</button>
      </div>
      <div className="user-area">
        <button className="btn ghost" onClick={onLogout}>Log out</button>
      </div>
    </div>
  )
}
