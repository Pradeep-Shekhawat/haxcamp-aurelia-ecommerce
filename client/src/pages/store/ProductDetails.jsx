import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { money } from '../../utils';
import { ApiErrorState, EmptyState, LoadingButton, LoadingState } from '../../components/Feedback';

export function ProductDetails({ onAdd }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  async function loadProduct() {
    setLoading(true);
    setError('');
    setNotFound(false);
    try { setProduct(await api(`/products/${id}`)); }
    catch (err) { if (err.status === 404) setNotFound(true); else setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProduct(); }, [id]);

  if (loading) return <section className="section container"><LoadingState text="Loading product…" /></section>;
  if (notFound) return <section className="section container"><EmptyState text="Product not found." /></section>;
  if (error) return <section className="section container"><ApiErrorState message={error} onRetry={loadProduct} /></section>;
  if (!product) return null;

  async function handleAdd() {
    setAdding(true);
    onAdd(product);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    setAdding(false);
    navigate('/cart');
  }

  return (
    <section className="section container">
      <div className="detail-grid">
        <img className="detail-image" src={product.image_url} alt={product.name} />
        <div>
          <div className="eyebrow">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="detail-rating">★ {product.rating} · {product.stock} in stock</div>
          <div className="detail-price">{money(product.price)} {product.compare_price && <del>{money(product.compare_price)}</del>}</div>
          <p className="detail-copy">{product.description}</p>
          <ul className="feature-list"><li>Designed for everyday performance</li><li>Fast, simple setup</li><li>12-month limited warranty</li></ul>
          <LoadingButton className="btn-primary" loading={adding} loadingText="Adding…" onClick={handleAdd}>Add to cart</LoadingButton>
        </div>
      </div>
    </section>
  );
}
