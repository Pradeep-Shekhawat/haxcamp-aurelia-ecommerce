import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { parseStoredJson } from './utils';
import { Navbar, Footer } from './components/Layout';
import { CartToast } from './components/Feedback';
import { Home, Products, ProductDetails, Cart, Checkout } from './pages/store';
import { AdminLayout } from './pages/admin';
import { NotFound } from './components/Feedback';
import './styles.css';

function App() {
  const { pathname } = useLocation();
  const [cart, setCart] = useState(() => parseStoredJson('aurelia_cart', []));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('aurelia_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);


  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...current, { ...product, qty: 1 }];
    });
    setToast({ id: product.id, name: product.name });
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function updateCartItem(id, quantity) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, qty: Math.max(1, quantity) } : item));
  }

  return (
    <div className="app">
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} />
      <Routes>
        <Route path="/" element={<Home onAdd={addToCart} />} />
        <Route path="/products" element={<Products onAdd={addToCart} />} />
        <Route path="/products/:id" element={<ProductDetails onAdd={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} update={updateCartItem} remove={removeFromCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} clear={() => setCart([])} />} />
        <Route path="/admin/login" element={<AdminLayout />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
