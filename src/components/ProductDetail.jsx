import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './ProductDetail.css';

const formatoPrecio = (precio) => {
    const valor = Number(precio);
    return Number.isFinite(valor)
        ? new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
        }).format(valor)
        : 'Precio no disponible';
};

const ProductDetail = ({ onAddToCart }) => {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favorito, setFavorito] = useState(false);
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);

    useEffect(() => {
        let activo = true;
        setLoading(true);
        setError('');
        setProducto(null);

        fetch(`/api/productos/${id}`)
            .then((response) => {
                if (!response.ok) throw new Error('No encontramos ese producto.');
                return response.json();
            })
            .then((data) => {
                if (activo) setProducto(data);
            })
            .catch((fetchError) => {
                if (activo) setError(fetchError.message);
            })
            .finally(() => {
                if (activo) setLoading(false);
            });

        return () => {
            activo = false;
        };
    }, [id]);

    if (loading) {
        return <div className="product-detail-state">Cargando producto...</div>;
    }

    if (error || !producto) {
        return (
            <div className="product-detail-state" role="alert">
                <h2>{error || 'Producto no encontrado'}</h2>
                <Link className="product-detail-back" to="/productos">Volver al catálogo</Link>
            </div>
        );
    }

    const stock = Number(producto.stock);
    const tieneStock = Number.isFinite(stock) && stock > 0;
    const etiquetas = Array.isArray(producto.etiquetas) ? producto.etiquetas : [];

    const agregarAlCarrito = () => {
        onAddToCart?.(producto, cantidad);
        setAgregado(true);
    };

    return (
        <main className="product-detail-page">
            <nav className="product-breadcrumb" aria-label="Ruta de navegación">
                <Link to="/">Inicio</Link>
                <span>/</span>
                <Link to="/productos">Productos</Link>
                <span>/</span>
                <span aria-current="page">{producto.nombre}</span>
            </nav>

            <section className="product-detail-layout">
                <div className="product-detail-gallery">
                    {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                        <div className="product-detail-no-image">Imagen no disponible</div>
                    )}
                </div>

                <div className="product-detail-info">
                    {producto.nombreCategoria && (
                        <p className="product-detail-category">{producto.nombreCategoria}</p>
                    )}
                    <h1>{producto.nombre}</h1>
                    <p className="product-detail-price">{formatoPrecio(producto.precio)}</p>

                    <p className={`product-detail-stock ${tieneStock ? 'is-available' : 'is-unavailable'}`}>
                        {tieneStock ? `En stock: ${stock} unidades` : 'Sin stock disponible'}
                    </p>

                    <p className="product-detail-description">
                        {producto.descripcion || 'Consultá los detalles de este producto con nuestro equipo.'}
                    </p>

                    {producto.talle && (
                        <p className="product-detail-size"><strong>Talle:</strong> {producto.talle}</p>
                    )}

                    {etiquetas.length > 0 && (
                        <div className="product-detail-tags" aria-label="Etiquetas del producto">
                            {etiquetas.map((etiqueta) => (
                                <span key={etiqueta}>{etiqueta}</span>
                            ))}
                        </div>
                    )}

                    <div className="product-detail-actions">
                        <label className="product-detail-quantity">
                            <span>Cantidad</span>
                            <select
                                value={cantidad}
                                onChange={(event) => {
                                    setCantidad(Number(event.target.value));
                                    setAgregado(false);
                                }}
                                disabled={!tieneStock}
                            >
                                {Array.from({ length: Math.min(stock || 1, 10) }, (_, index) => index + 1).map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            className="product-detail-add"
                            type="button"
                            onClick={agregarAlCarrito}
                            disabled={!tieneStock}
                        >
                            {agregado ? 'Agregado al carrito ✓' : 'Agregar al carrito'}
                        </button>
                        <button
                            className={`product-detail-favorite ${favorito ? 'is-favorite' : ''}`}
                            type="button"
                            aria-pressed={favorito}
                            onClick={() => setFavorito((estado) => !estado)}
                        >
                            <span aria-hidden="true">{favorito ? '♥' : '♡'}</span>
                            {favorito ? 'En favoritos' : 'Agregar a favoritos'}
                        </button>
                    </div>
                </div>
            </section>

            <section className="product-detail-extras">
                <h2>Compra con confianza</h2>
                <div>
                    <p><strong>Envíos a todo el país</strong><span>Recibí tu pedido donde estés.</span></p>
                    <p><strong>Pago seguro</strong><span>Elegí el medio de pago que prefieras.</span></p>
                    <p><strong>¿Tenés dudas?</strong><span>Estamos para ayudarte con tu compra.</span></p>
                </div>
            </section>
        </main>
    );
};

export default ProductDetail;
