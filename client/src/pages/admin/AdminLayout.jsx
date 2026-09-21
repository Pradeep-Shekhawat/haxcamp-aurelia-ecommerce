import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function AdminLayout() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('aurelia_token'));

  function handleAuthenticated() { setToken(localStorage.getItem('aurelia_token')); }

  function handleAuthExpired() {
    localStorage.removeItem('aurelia_token');
    localStorage.removeItem('aurelia_admin');
    setToken(null);
    navigate('/admin/login', { replace: true });
  }

  if (!token) return <AdminLogin onAuthenticated={handleAuthenticated} />;
  return <AdminDashboard onAuthExpired={handleAuthExpired} />;
}
