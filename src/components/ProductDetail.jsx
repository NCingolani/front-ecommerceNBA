import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './ProductDetail.css';

const imagenesProductos = {
    'Jersey LeBron James #23 Lakers': '/Images/Productos/JerseyLeBronJames.jpg',
    'Jersey LeBron James Lakers': '/Images/Productos/JerseyLeBronJames.jpg',
    'Jersey Stephen Curry #30 Warriors': '/Images/Productos/JerseyStephenCurry.jpg',
    'Jersey Stephen Curry Warriors': '/Images/Productos/JerseyStephenCurry.jpg',
    'Zapatillas Nike Luka 2': '/Images/Productos/ZapatillasNikeLuka2.jpg'
};

const ProductDetail = ({ onAddToCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session } = useAuth();
    const esAdmin = session?.role === 'ADMIN';

    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [favorito, setFavorito] = useState(false);

    useEffect(() => {
        fetch(`/api/productos/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Producto no encontrado o error de servidor');
                return res.json();
            })
            .then((data) => {
                setProducto(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;

        try {
            const res = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.token || localStorage.getItem('token')}`
                }
            });

            if (!res.ok) throw new Error('Error al eliminar. Verificá tener permisos de ADMIN.');
            navigate('/productos');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <div className="product-detail-state">Cargando detalle...</div>;
    }

    if (error || !producto) {
        return (
            <div className="product-detail-state">
                <h2>{error || 'Producto no encontrado'}</h2>
                <Link to="/productos" className="product-detail-back">Volver al catálogo</Link>
            </div>
        );
    }

    const imagen = imagenesProductos[producto.nombre?.trim()] || producto.imagen;
    const stock = Number(producto.stock ?? 10);
    const disponible = stock > 0;
    const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(Number(producto.precio) || 0);

    return (
        <main className="product-detail-page">
            <nav className="product-breadcrumb">
                <Link to="/">Inicio</Link>
                <span>/</span>
                <Link to="/productos">Catálogo</Link>
                <span>/</span>
                <span>{producto.nombre}</span>
            </nav>

            <div className="product-detail-layout">
                <div className="product-detail-gallery">
                    {imagen ? (
                        <img src={imagen} alt={producto.nombre} />
                    ) : (
                        <p className="product-detail-no-image">Sin imagen disponible</p>
                    )}
                </div>

                <div className="product-detail-info">
                    <p className="product-detail-category">
                        {producto.nombreCategoria || 'Oficial NBA'}
                    </p>
                    <h1>{producto.nombre}</h1>
                    <p className="product-detail-price">{precioFormateado}</p>

                    <p className={`product-detail-stock ${disponible ? 'is-available' : 'is-unavailable'}`}>
                        {disponible ? `En stock (${stock} disponibles)` : 'Sin stock'}
                    </p>

                    {producto.descripcion && (
                        <p className="product-detail-description">{producto.descripcion}</p>
                    )}

                    <p className="product-detail-size">
                        Talle: <strong>{producto.talle || 'Único'}</strong>
                    </p>

                    {Array.isArray(producto.etiquetas) && producto.etiquetas.length > 0 && (
                        <div className="product-detail-tags">
                            {producto.etiquetas.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="product-detail-actions">
                        <label className="product-detail-quantity">
                            Cantidad
                            <select
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                disabled={!disponible}
                            >
                                {Array.from({ length: Math.min(Math.max(stock, 1), 10) }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="button"
                            className="product-detail-add"
                            disabled={!disponible}
                            onClick={() => onAddToCart && onAddToCart({ ...producto, cantidad })}
                        >
                            🛒 Añadir al carrito
                        </button>

                        <button
                            type="button"
                            className={`product-detail-favorite ${favorito ? 'is-favorite' : ''}`}
                            onClick={() => setFavorito(!favorito)}
                        >
                            <span>{favorito ? '♥' : '♡'}</span>
                            {favorito ? 'En tu wishlist' : 'Agregar a favoritos'}
                        </button>

                        {esAdmin && (
                            <button
                                type="button"
                                className="product-detail-add"
                                style={{ gridColumn: '1 / -1' }}
                                onClick={handleDelete}
                            >
                                🗑 Eliminar producto (Admin)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetail;
