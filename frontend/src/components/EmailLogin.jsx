import React, { useState } from 'react'
import Doodles from './Doodles'

export default function EmailLogin({ onSuccess, onClose }) {
  const [step, setStep] = useState('email') // 'email' or 'code'
  const [email, setEmail] = useState('') // Ne plus pré-remplir l'email
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  async function handleRequestCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3002/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Échec de l\'envoi du code')
      }

      setCodeSent(true)
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3002/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Code invalide')
      }

      // Store token
      localStorage.setItem('frelsi_token', data.token)
      
      // Success!
      onSuccess(data.token)
    } catch (err) {
      setError(err.message)
      setCode('') // Clear code on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-backdrop" onClick={onClose}>
      <Doodles />
      <div className="admin-login-card" onClick={(e) => e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <div className="login-icon">
          🔐
        </div>
        
        <h2 className="login-title">Connexion Admin</h2>
        <p className="login-subtitle">
          {step === 'email' ? 'Entrez votre email pour recevoir un code' : 'Entrez le code reçu par email'}
        </p>

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="login-form">
            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <input
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lakhdarberache@gmail.com"
                required
                autoFocus
                disabled={loading}
              />
              <p className="form-hint">
                Un code à 6 chiffres sera envoyé à cette adresse
              </p>
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

            <button type="submit" className="btn primary login-submit" disabled={loading}>
              {loading ? '⏳ Envoi...' : '📧 Envoyer le code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="login-form">
            <div className="login-success-message">
              ✅ Code envoyé à <strong>{email}</strong>
              <br />
              <small>Vérifiez votre boîte mail (et spam)</small>
            </div>

            <div className="form-group">
              <label className="form-label">Code de vérification</label>
              <input
                type="text"
                className="login-input code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
                autoFocus
                disabled={loading}
              />
              <p className="form-hint">
                ⏱️ Le code expire dans 10 minutes
              </p>
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn" 
                onClick={() => setStep('email')} 
                disabled={loading}
              >
                ← Retour
              </button>
              <button 
                type="submit" 
                className="btn primary" 
                disabled={loading || code.length !== 6}
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Vérification...' : '🔓 Se connecter'}
              </button>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCodeSent(false)
                  setError('')
                }}
                className="link-button"
                disabled={loading}
              >
                📧 Renvoyer un code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
