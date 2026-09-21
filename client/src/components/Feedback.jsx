import React from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from './Icons';

export function LoadingButton({ loading, children, loadingText, className = '', type = 'button', ...props }) {
  return (
    <button type={type} className={`btn ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="btn-loading-content">
          <Spinner size={16} />
          {loadingText || 'Working…'}
        </span>
      ) : children}
    </button>
  );
}

export function LoadingState({ text = 'Loading…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function LoadingCards({ count = 4 }) {
  return Array.from({ length: count }).map((_, index) => (
    <div className="product-card skeleton-card" key={index} aria-hidden="true">
      <div className="skeleton-image shimmer" />
      <div className="product-info">
        <div className="skeleton-line shimmer" />
        <div className="skeleton-line short shimmer" />
        <div className="skeleton-button shimmer" />
      </div>
    </div>
  ));
}

export function EmptyState({ text, children }) {
  return <div className="empty"><h3>{text}</h3>{children}</div>;
}

export function ApiErrorState({ message = 'Something went wrong while loading this page.', onRetry }) {
  return (
    <div className="api-error-state" role="alert">
      <div className="admin-load-error-icon">!</div>
      <h3>We couldn't load this right now.</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function CartToast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <div className="cart-toast-icon">✓</div>
      <div className="cart-toast-copy">
        <strong>Added to cart</strong>
        <span>{toast.name}</span>
      </div>
      <Link className="cart-toast-link" to="/cart" onClick={onClose}>View cart</Link>
      <button className="cart-toast-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}

export function ActionToast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="action-toast" role="status" aria-live="polite">
      <div className="action-toast-icon">✓</div>
      <div className="action-toast-copy">
        <strong>{toast.title}</strong>
        <span>{toast.message}</span>
      </div>
      <button className="cart-toast-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}

export function NotFound() {
  return (
    <section className="section container">
      <EmptyState text="That page doesn't exist.">
        <Link className="btn btn-primary" to="/">Back home</Link>
      </EmptyState>
    </section>
  );
}
