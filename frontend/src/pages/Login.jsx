import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onLogin({ name: name.trim() })
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="brand">Frelsi</div>
        <p className="tagline">A personal notebook for your ideas, texts and inspirations.</p>

        <form onSubmit={submit} className="login-form">
          <label>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
          <div className="actions">
            <button type="submit" className="btn primary">Sign in / Create</button>
          </div>
        </form>

        <div className="hint">
          <strong>Initial features</strong>
          <ul>
            <li>Create and update small personal notebooks</li>
            <li>View all notebooks and generate recommendations (front-end only for now)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
