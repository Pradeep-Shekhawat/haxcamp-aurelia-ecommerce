import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { ApiErrorState, EmptyState, LoadingCards } from '../../components/Feedback';
import { ProductCard } from '../../components/ProductCard';

export function Products({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');
    try { setProducts(await api('/products')); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category))], [products]);
  const filtered = products.filter((product) =>
    (product.name + product.description).toLowerCase().includes(query.toLowerCase()) &&
    (category === '' || category === 'All' || product.category === category),
  );

  return (
    <section className="section container">
      <div className="page-head"><div><div className="eyebrow">SHOP</div><h1>All products</h1><p>Simple, high-quality technology for work and life.</p></div></div>
      <div className="filters">
        <input aria-label="Search products" placeholder="Search products..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="chips">{categories.map((item) => <button type="button" key={item} className={item === (category || 'All') ? 'chip active' : 'chip'} onClick={() => setCategory(item === 'All' ? '' : item)}>{item}</button>)}</div>
      </div>
      {loading ? <div className="product-grid"><LoadingCards count={6} /></div> : error ? <ApiErrorState message={error} onRetry={loadProducts} /> : filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div> : <EmptyState text="No products match your search." />}
    </section>
  );
}
