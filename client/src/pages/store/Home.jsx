import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { discountPercent, money } from '../../utils';
import { HeadsetIcon, ShieldCheckIcon, TruckIcon } from '../../components/Icons';
import { ApiErrorState, LoadingCards } from '../../components/Feedback';
import { ProductCard } from '../../components/ProductCard';

export function Home({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      setProducts(await api('/products'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  const featured = products.slice(0, 4);
  const heroProduct = featured[0];
  const bestDiscount = products.reduce((max, product) => Math.max(max, discountPercent(product.price, product.compare_price)), 0);

  if (error && !products.length) {
    return <section className="section container"><ApiErrorState message={error} onRetry={loadProducts} /></section>;
  }

  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">MODERN TECH · CURATED DAILY</div>
          <h1>Technology that fits your life.</h1>
          <p>Premium essentials designed around clarity, comfort and everyday performance.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/products">Shop collection</Link>
            <a className="btn btn-ghost" href="#featured">Explore picks</a>
          </div>
          <div className="hero-trust">
            <span>✓ Curated selection</span>
            <span>✓ Fast ordering</span>
            <span>✓ Local support</span>
          </div>
        </div>

        {loading ? (
          <div className="hero-card hero-product-card skeleton-hero">
            <div className="skeleton-hero-image shimmer" />
          </div>
        ) : heroProduct ? (
          <Link className="hero-card hero-product-card" to={`/products/${heroProduct.id}`}>
            <div className="hero-card-top">
              <div className="hero-card-badge">AURELIA FEATURED</div>
              {discountPercent(heroProduct.price, heroProduct.compare_price) > 0 && (
                <span className="hero-sale">-{discountPercent(heroProduct.price, heroProduct.compare_price)}%</span>
              )}
            </div>
            <div className="hero-product-image">
              <img src={heroProduct.image_url} alt={heroProduct.name} />
            </div>
            <div className="hero-product-bottom">
              <div>
                <span className="hero-category">{heroProduct.category}</span>
                <strong>{heroProduct.name}</strong>
                <span>{money(heroProduct.price)} <del>{heroProduct.compare_price ? money(heroProduct.compare_price) : ''}</del></span>
              </div>
              <span className="hero-arrow">↗</span>
            </div>
          </Link>
        ) : null}
      </div>
    </section>

    <section className="benefits" aria-label="Store benefits">
      <div className="container benefits-grid">
        <div><span className="benefit-icon"><TruckIcon size={18} /></span><div><strong>Free delivery</strong><span>On orders over ₹5,000</span></div></div>
        <div><span className="benefit-icon"><ShieldCheckIcon size={18} /></span><div><strong>Secure ordering</strong><span>Simple, protected checkout</span></div></div>
        <div><span className="benefit-icon"><HeadsetIcon size={18} /></span><div><strong>Human support</strong><span>We answer within 24 hours</span></div></div>
      </div>
    </section>

    <section id="featured" className="section container">
      <div className="section-head">
        <div><div className="eyebrow">THE COLLECTION</div><h2>Featured essentials</h2></div>
        <Link className="text-link" to="/products">View all →</Link>
      </div>
      <div className="product-grid">
        {loading ? <LoadingCards count={4} /> : featured.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
      </div>
    </section>

    {!loading && bestDiscount > 0 && (
      <section className="promo">
        <div className="container promo-inner">
          <div><div className="eyebrow">AURELIA PICKS</div><h2>Better technology, better everyday.</h2><p>Save up to {bestDiscount}% on selected essentials while stock lasts.</p></div>
          <Link className="btn btn-primary" to="/products">Shop the picks</Link>
        </div>
      </section>
    )}

    <section className="story">
      <div className="container story-grid"><div><div className="eyebrow">OUR APPROACH</div><h2>Less noise.<br />More useful technology.</h2></div><p>We build our catalogue around products that earn their place: considered design, practical features and a better day-to-day experience. The collection stays compact so every interaction feels finished.</p></div>
    </section>
  </>;
}
