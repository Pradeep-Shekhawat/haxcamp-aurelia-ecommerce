import React, { useState } from 'react';
import { api } from '../../api';
import { money } from '../../utils';
import { Spinner } from '../../components/Icons';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function OrderManager({ orders, reload }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function updateStatus(id, status) {
    setUpdatingId(id);
    setMessage('');
    setError('');
    try { await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await reload(); setMessage('Order status updated.'); }
    catch (err) { setError(err.message); }
    finally { setUpdatingId(null); }
  }

  return (
    <div className="manager">
      <div className="manager-head"><p className="muted">Track and update recent customer orders.</p>{message && <div className="inline-success">✓ {message}</div>}</div>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="panel table-wrap">
        <table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id}><td>#{order.id}</td><td><strong>{order.customer_name}</strong><br /><span className="muted">{order.customer_email}</span></td><td>{money(order.total_amount)}</td><td><div className="select-with-status"><select disabled={updatingId === order.id} value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>{ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>{updatingId === order.id && <Spinner size={14} />}</div></td><td>{new Date(order.created_at).toLocaleString('en-IN')}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
