import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { LoadingState } from '../../components/Feedback';
import { OrderManager } from './OrderManager';
import { Overview } from './Overview';
import { ProductManager } from './ProductManager';

export function AdminDashboard({ onAuthExpired }) {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  function handle401(err) {
    if (err?.status === 401) { onAuthExpired?.(); navigate('/admin/login', { replace: true }); return true; }
    return false;
  }

  async function loadOverview() {
    try { setLoadError(''); const overview = await api('/admin/overview'); setData(overview); return true; }
    catch (err) { if (!handle401(err)) setLoadError(err.message || 'Could not load the dashboard.'); return false; }
  }

  async function loadProducts() {
    try { setProducts(await api('/products')); return true; }
    catch (err) { if (handle401(err)) return false; throw err; }
  }

  async function loadOrders() {
    try { setOrders(await api('/admin/orders')); return true; }
    catch (err) { if (handle401(err)) return false; throw err; }
  }

  async function loadCurrentTab() {
    setTabLoading(true);
    setLoadError('');
    try {
      await loadOverview();
      if (tab === 'products') await loadProducts();
      if (tab === 'orders') await loadOrders();
    } catch (err) { setLoadError(err.message || 'Could not load this section.'); }
    finally { setTabLoading(false); setLoading(false); }
  }

  useEffect(() => {
    let cancelled = false;
    async function initialLoad() {
      setLoading(true);
      const ok = await loadOverview();
      if (!cancelled) setLoading(false);
      if (!ok && !cancelled) setData(null);
    }
    initialLoad();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (tab === 'overview' || !data) return;
    let cancelled = false;
    async function fetchTab() {
      setTabLoading(true);
      setLoadError('');
      try {
        if (tab === 'products') await loadProducts();
        if (tab === 'orders') await loadOrders();
      } catch (err) { if (!cancelled) setLoadError(err.message || `Could not load ${tab}.`); }
      finally { if (!cancelled) setTabLoading(false); }
    }
    fetchTab();
    return () => { cancelled = true; };
  }, [tab]);

  function logout() {
    localStorage.removeItem('aurelia_token');
    localStorage.removeItem('aurelia_admin');
    onAuthExpired?.();
  }

  const admin = (() => { try { return JSON.parse(localStorage.getItem('aurelia_admin') || '{}'); } catch { return {}; } })();

  if (loading && !data) return <section className="admin-loading">{loadError ? <div className="admin-load-error" role="alert"><div className="admin-load-error-icon">!</div><h3>Dashboard could not load</h3><p>{loadError}</p><button className="btn btn-primary" onClick={loadCurrentTab}>Try again</button></div> : <LoadingState text="Loading dashboard…" />}</section>;

  if (!data) return <section className="admin-loading"><div className="admin-load-error" role="alert"><div className="admin-load-error-icon">!</div><h3>Dashboard could not load</h3><p>{loadError || 'Please try again.'}</p><button className="btn btn-primary" onClick={loadCurrentTab}>Try again</button></div></section>;

  return (
    <section className="admin-shell">
      <div className="admin-sidebar">
        <div className="brand">AURELIA<span>.</span></div>
        <div className="admin-caption">ADMIN</div>
        <button type="button" className={tab === 'overview' ? 'side active' : 'side'} onClick={() => setTab('overview')}>Overview</button>
        <button type="button" className={tab === 'products' ? 'side active' : 'side'} onClick={() => setTab('products')}>Products</button>
        <button type="button" className={tab === 'orders' ? 'side active' : 'side'} onClick={() => setTab('orders')}>Orders</button>
        <div className="side-bottom"><Link to="/">View store</Link><button type="button" className="side" onClick={logout}>Sign out</button></div>
      </div>
      <div className="admin-content">
        <div className="admin-top"><div><div className="eyebrow">AURELIA ADMIN</div><h1>{tab[0].toUpperCase() + tab.slice(1)}</h1></div><div className="admin-user">{admin.name || 'Admin'}</div></div>
        {loadError && tab !== 'overview' && <div className="error admin-inline-error" role="alert">{loadError}</div>}
        {tab === 'overview' && <Overview data={data} onOrders={() => setTab('orders')} />}
        {tab === 'products' && (tabLoading ? <LoadingState text="Loading products…" /> : <ProductManager products={products} reload={loadCurrentTab} showForm={showForm} setShowForm={setShowForm} edit={edit} setEdit={setEdit} />)}
        {tab === 'orders' && (tabLoading ? <LoadingState text="Loading orders…" /> : <OrderManager orders={orders} reload={loadCurrentTab} />)}
      </div>
    </section>
  );
}
