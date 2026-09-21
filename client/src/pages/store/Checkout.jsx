import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { money } from '../../utils';
import { EmptyState, LoadingButton } from '../../components/Feedback';
import { Spinner } from '../../components/Icons';

export function Checkout({ cart, clear }) {
  const [form, setForm] = useState({ customer_name: '', customer_email: '' });
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const delivery = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + delivery;

  if (!cart.length && !done) return <section className="section container"><EmptyState text="Add something to your cart first."><Link className="btn btn-primary" to="/products">Go to shop</Link></EmptyState></section>;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const order = await api('/orders', { method: 'POST', body: JSON.stringify({ ...form, items: cart.map((item) => ({ product_id: item.id, quantity: item.qty })) }) });
      clear();
      setDone(order);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <section className="section container narrow">
      {done ? (
        <div className="success"><div className="success-icon">✓</div><div className="eyebrow">ORDER CONFIRMED</div><h1>Thank you, {done.customer_name}.</h1><p>Your order <strong>#{done.id}</strong> has been placed successfully.</p><Link className="btn btn-primary" to="/products">Continue shopping</Link></div>
      ) : (
        <>
          <div className="page-head"><div><div className="eyebrow">CHECKOUT</div><h1>Complete your order</h1></div></div>
          <form className="checkout-card" onSubmit={submit} aria-busy={submitting}>
            <label>Full name<input required maxLength={120} disabled={submitting} value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></label>
            <label>Email address<input required type="email" maxLength={180} disabled={submitting} value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} /></label>
            <div className="checkout-total"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{delivery ? money(delivery) : 'Free'}</strong></div><hr /><div><span>Order total</span><strong>{money(total)}</strong></div></div>
            {error && <div className="error" role="alert">{error}</div>}
            <LoadingButton className="btn-primary full" type="submit" loading={submitting} loadingText="Placing your order…">Place order</LoadingButton>
            {submitting && <div className="form-progress" role="status"><Spinner size={15} /> Processing your order securely…</div>}
          </form>
        </>
      )}
    </section>
  );
}
