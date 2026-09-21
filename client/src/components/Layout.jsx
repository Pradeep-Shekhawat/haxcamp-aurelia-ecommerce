import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Navbar({ cartCount }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={closeMenu}>AURELIA<span>.</span></Link>
        <button className="mobile-menu" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>☰</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/products" onClick={closeMenu}>Shop</Link>
          <Link to="/admin" onClick={closeMenu}>Admin</Link>
          <Link className="cart-link" to="/cart" onClick={closeMenu}>Cart <span>{cartCount}</span></Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <div className="brand">AURELIA<span>.</span></div>
          <p>Thoughtful technology for modern living.</p>
          <div className="footer-note">Curated essentials, simple shopping.</div>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/products">All products</Link>
          <Link to="/cart">Your cart</Link>
          <Link to="/admin">Admin dashboard</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>hello@aurelia.store</p>
          <p>Mumbai · India</p>
          <div className="footer-note">Support within 24 hours.</div>
        </div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} Aurelia Store. All rights reserved.</div>
    </footer>
  );
}
