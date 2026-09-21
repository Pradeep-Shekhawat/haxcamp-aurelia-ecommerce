import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { LoadingButton } from '../../components/Feedback';
import { Spinner } from '../../components/Icons';

export function AdminLogin({ onAuthenticated }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@aurelia.store');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function warmUpApi() {
      setCheckingServer(true);
      try { await api('/health'); if (!cancelled) setServerReady(true); }
      catch { if (!cancelled) setServerReady(false); }
      finally { if (!cancelled) setCheckingServer(false); }
    }
    warmUpApi();
    return () => { cancelled = true; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api('/auth/login', { method: 'POST', retryNetwork: true, body: JSON.stringify({ email, password }) });
      localStorage.setItem('aurelia_token', data.token);
      localStorage.setItem('aurelia_admin', JSON.stringify(data.user));
      onAuthenticated?.(data);
      navigate('/admin', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <section className="auth-section">
      <form className="auth-card" onSubmit={submit} aria-busy={submitting}>
        <div className="brand">AURELIA<span>.</span></div>
        <div className="eyebrow">ADMIN CONSOLE</div>
        <h1>Sign in</h1>
        <label>Email<input required type="email" autoComplete="username" disabled={submitting} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input required type="password" autoComplete="current-password" disabled={submitting} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <div className="error" role="alert">{error}</div>}
        {!serverReady && !checkingServer && !error && <div className="error" role="alert">The Aurelia API is not reachable yet. Make sure the backend is running, then try again.</div>}
        <LoadingButton className="btn-dark full" type="submit" disabled={!serverReady || checkingServer} loading={submitting} loadingText="Signing in…">{checkingServer ? 'Connecting to API…' : 'Open dashboard'}</LoadingButton>
        {(checkingServer || submitting) && <div className="form-progress" role="status"><Spinner size={15} /> {checkingServer ? 'Connecting to Aurelia API…' : 'Verifying admin credentials…'}</div>}
        <Link to="/">← Back to store</Link>
      </form>
    </section>
  );
}
