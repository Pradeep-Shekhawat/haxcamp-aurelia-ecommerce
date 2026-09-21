import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { discountPercent, money } from '../utils';
import { LoadingButton } from './Feedback';

export function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  function handleAdd(event) {
    event.preventDefault();
    onAdd(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  const discount = discountPercent(product.price, product.compare_price);

  return (
    <article className="product-card">
      <Link className="product-media" to={`/products/${product.id}`}>
        <img loading="lazy" src={product.image_url} alt={product.name} />
        {discount > 0 && <span className="product-badge">-{discount}%</span>}
      </Link>
      <div className="product-info">
        <div className="product-meta"><span>{product.category}</span><span>★ {product.rating}</span></div>
        <Link className="product-name" to={`/products/${product.id}`}>{product.name}</Link>
        <div className="price-row">
          <strong>{money(product.price)}</strong>
          {product.compare_price && <del>{money(product.compare_price)}</del>}
        </div>
        <LoadingButton
          className={`full ${added ? 'btn-added' : 'btn-dark'}`}
          onClick={handleAdd}
        >
          {added ? 'Added ✓' : 'Add to cart'}
        </LoadingButton>
      </div>
    </article>
  );
}
