import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { money } from '../../utils';
import { LoadingButton } from '../../components/Feedback';

const emptyProduct = { name: '', category: 'Audio', description: '', price: '', compare_price: '', stock: '10', image_url: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=85', rating: '4.7' };

export function ProductManager({ products, reload, showForm, setShowForm, edit, setEdit }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setForm(edit ? { ...emptyProduct, ...edit } : emptyProduct); }, [edit]);

  function handleFormChange(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api(`/products${edit ? `/${edit.id}` : ''}`, { method: edit ? 'PUT' : 'POST', body: JSON.stringify({ ...form, price: Number(form.price), compare_price: form.compare_price ? Number(form.compare_price) : null, stock: Number(form.stock), rating: Number(form.rating) }) });
      setShowForm(false);
      setEdit(null);
      setSuccess(edit ? 'Product updated.' : 'Product created.');
      await reload();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function removeProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    setSuccess('');
    setDeletingId(id);
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      setSuccess('Product deleted.');
      await reload();
    } catch (err) { setError(err.message); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="manager">
      <div className="manager-head"><p className="muted">Manage catalogue, stock and pricing.</p><button type="button" className="btn btn-primary" onClick={() => { setForm(emptyProduct); setEdit(null); setError(''); setSuccess(''); setShowForm(true); }}>+ Add product</button></div>
      {(error || success) && <div className={error ? 'error' : 'inline-success'} role="alert">{error || `✓ ${success}`}</div>}
      {showForm && (
        <form className="panel product-form" onSubmit={submit} aria-busy={saving}>
          <div className="form-grid">
            <label>Product name<input required maxLength={180} disabled={saving} value={form.name} onChange={(event) => handleFormChange('name', event.target.value)} /></label>
            <label>Category<input required maxLength={80} disabled={saving} value={form.category} onChange={(event) => handleFormChange('category', event.target.value)} /></label>
            <label>Price<input required min="0" step="0.01" type="number" disabled={saving} value={form.price} onChange={(event) => handleFormChange('price', event.target.value)} /></label>
            <label>Compare price<input min="0" step="0.01" type="number" disabled={saving} value={form.compare_price} onChange={(event) => handleFormChange('compare_price', event.target.value)} /></label>
            <label>Stock<input required min="0" step="1" type="number" disabled={saving} value={form.stock} onChange={(event) => handleFormChange('stock', event.target.value)} /></label>
            <label>Rating<input required type="number" step="0.1" min="0" max="5" disabled={saving} value={form.rating} onChange={(event) => handleFormChange('rating', event.target.value)} /></label>
            <label className="span-2">Image URL<input required disabled={saving} value={form.image_url} onChange={(event) => handleFormChange('image_url', event.target.value)} /></label>
            <label className="span-2">Description<textarea rows="4" required maxLength={1000} disabled={saving} value={form.description} onChange={(event) => handleFormChange('description', event.target.value)} /></label>
          </div>
          <div className="form-actions"><button type="button" className="btn btn-ghost" disabled={saving} onClick={() => { setShowForm(false); setEdit(null); }}>Cancel</button><LoadingButton className="btn-primary" type="submit" loading={saving} loadingText={edit ? 'Saving…' : 'Creating…'}>{edit ? 'Save changes' : 'Create product'}</LoadingButton></div>
        </form>
      )}
      <div className="panel table-wrap">
        <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
          <tbody>{products.map((product) => <tr key={product.id}><td><div className="table-product"><img src={product.image_url} alt="" /><strong>{product.name}</strong></div></td><td>{product.category}</td><td>{money(product.price)}</td><td><span className={product.stock <= 10 ? 'stock low' : 'stock'}>{product.stock}</span></td><td><div className="actions"><button type="button" disabled={deletingId === product.id} onClick={() => { setEdit(product); setShowForm(true); setError(''); setSuccess(''); }}>Edit</button><LoadingButton className="btn-small-delete" loading={deletingId === product.id} loadingText="…" onClick={() => removeProduct(product.id)}>Delete</LoadingButton></div></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
