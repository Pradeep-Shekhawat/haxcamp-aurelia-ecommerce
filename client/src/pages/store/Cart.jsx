import React from 'react';
import { Link } from 'react-router-dom';
import { money } from '../../utils';
import { EmptyState } from '../../components/Feedback';

export function Cart({ cart, update, remove }) {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const delivery = subtotal >= 5000 ? 0 : 199;
  const total = subtotal + delivery;

  return (
    <section className="section container">
      <div className="page-head"><div><div className="eyebrow">YOUR BAG</div><h1>Cart</h1></div></div>
      {!cart.length ? <EmptyState text="Your cart is empty."><Link className="btn btn-primary" to="/products">Browse products</Link></EmptyState> : (
        <div className="cart-grid">
          <div>{cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <div className="cart-item-main"><strong>{item.name}</strong><span>{money(item.price)}</span>
                <div className="qty"><button type="button" aria-label={`Decrease ${item.name}`} onClick={() => update(item.id, item.qty - 1)}>-</button><span>{item.qty}</span><button type="button" aria-label={`Increase ${item.name}`} onClick={() => update(item.id, item.qty + 1)}>+</button><button type="button" className="remove" onClick={() => remove(item.id)}>Remove</button></div>
              </div>
            </div>
          ))}</div>
          <aside className="summary-card"><h3>Order summary</h3><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{delivery ? money(delivery) : 'Free'}</strong></div><hr /><div><span>Total</span><strong>{money(total)}</strong></div><Link className="btn btn-primary full" to="/checkout">Continue to checkout</Link></aside>
        </div>
      )}
    </section>
  );
}
