import React from 'react';
import ProductCard from './ProductCard';
import productsData from '../products.json';

const ProductList = () => {
  return (
    <div className="product-list">
      {productsData.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
};

export default ProductList;