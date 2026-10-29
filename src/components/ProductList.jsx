import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';

const normalizarCategoria = (valor = '') =>
  valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

const ProductList = ({ onAddToCart }) => {
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get('categoria')?.trim() || '';
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Llama al backend a través del proxy configurado en vite.config.js
    fetch('/api/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener productos');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar el catálogo. Intenta nuevamente más tarde.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '30px' }}>Cargando catálogo...</div>;
  if (error) return <p role="alert" style={{ textAlign: 'center', padding: '30px' }}>{error}</p>;

  const productosFiltrados = categoria
    ? productos.filter((producto) => normalizarCategoria(producto.nombreCategoria || '') === normalizarCategoria(categoria))
    : productos;

  return (
    <main className="catalog-page">
      <div className="catalog-heading">
        <div>
          <p>CATÁLOGO</p>
          <h1>{categoria || 'Todos los productos'}</h1>
        </div>
        {categoria && <Link to="/productos">Ver todos los productos</Link>}
      </div>

      <div className="product-list">
        {productosFiltrados.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            onAddToCart={onAddToCart}
          />
        ))}
        {productosFiltrados.length === 0 && (
          <p>{categoria ? `No hay productos en la categoría “${categoria}”.` : 'No hay productos disponibles.'}</p>
        )}
      </div>
    </main>
  );
};

export default ProductList;
