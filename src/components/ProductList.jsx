import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1er Componente que llama al endpoint GET /api/productos
    fetch('/api/productos')
      .then(response => {
        if (!response.ok) throw new Error('Error al obtener los productos');
        return response.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Cargando productos...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="product-list">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
};

export default ProductList;
