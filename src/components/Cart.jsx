import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../store/slices/cartSlice';
import Footer from './Footer';
import './Cart.css';

const imagenesProductos = {
    'Jersey LeBron James #23 Lakers': '/Images/Productos/JerseyLeBronJames.jpg',
    'Jersey LeBron James Lakers': '/Images/Productos/JerseyLeBronJames.jpg',
    'Jersey Stephen Curry #30 Warriors': '/Images/Productos/JerseyStephenCurry.jpg',
    'Jersey Stephen Curry Warriors': '/Images/Productos/JerseyStephenCurry.jpg',
    'Zapatillas Nike Luka 2': '/Images/Productos/ZapatillasNikeLuka2.jpg'
};

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Obtenemos los items desde el store global de Redux
    const cartItems = useSelector((store) => store.cart.items);

    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [navSearch, setNavSearch] = useState('');
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [failedImages, setFailedImages] = useState({});

    // Filtrado por búsqueda dentro del carrito
    const filteredItems = cartItems.filter((item) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase().trim();
        const nombre = String(item.nombre || '').toLowerCase();
        const descripcion = String(item.descripcion || '').toLowerCase();
        return nombre.includes(query) || descripcion.includes(query);
    });

    // Cantidad total de productos en el carrito
    const totalCount = cartItems.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

    // Cálculos dinámicos
    const subtotal = cartItems.reduce(
        (acc, item) => acc + (Number(item.precio || 0) * Number(item.cantidad || 0)),
        0
    );
    const envio = cartItems.length > 0 ? 1500 : 0;
    const descuentos = 0;
    const total = subtotal + envio - descuentos;

    const handleConfirmDelete = () => {
        if (itemToDelete !== null) {
            dispatch(removeFromCart(itemToDelete));
            setItemToDelete(null);
        }
    };

    const handleClearCart = () => {
        setItemToDelete(null);
        dispatch(clearCart());
    };

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity > 0) {
            dispatch(updateQuantity({ id, quantity: newQuantity }));
        } else {
            setItemToDelete(id);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        dispatch(clearCart());
        setCheckoutSuccess(true);
    };

    const handleNavSearchSubmit = (e) => {
        e.preventDefault();
        navigate('/productos');
    };

    const formatPrice = (value) => `$ ${Number(value || 0).toLocaleString('es-AR')}`;

    return (
        <div className="cart-wrapper">
            {/* Barra de navegación secundaria estilo Mockup */}
            <div className="cart-subnavbar">
                <Link to="/" className="cart-subnavbar-logo">
                    ◉ Tienda <span>NBA</span>
                </Link>

                <nav className="cart-subnavbar-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/productos">Productos</Link>
                    <Link to="/productos">Categorías</Link>
                    <a href="/#ofertas">Ofertas</a>
                    <a href="#footer">Contacto</a>
                </nav>

                <div className="cart-subnavbar-right">
                    <form onSubmit={handleNavSearchSubmit} className="cart-subnavbar-search">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={navSearch}
                            onChange={(e) => setNavSearch(e.target.value)}
                        />
                    </form>
                    <Link to="/carrito" className="cart-subnavbar-cart">
                        🛒 {totalCount}
                    </Link>
                </div>
            </div>

            {/* Contenedor principal del Carrito */}
            <div className="cart-page">
                <div className="cart-header-section">
                    <div className="cart-header">
                        <h1>Carrito</h1>
                        <div className="cart-search">
                            <label htmlFor="cart-search-input">Busqueda</label>
                            <div className="cart-search-box">
                                <input
                                    id="cart-search-input"
                                    type="text"
                                    placeholder="Busqueda"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="cart-search-icon" aria-hidden="true">🔍</span>
                            </div>
                        </div>
                    </div>
                </div>

                {checkoutSuccess ? (
                    <div className="cart-checkout-banner" role="status">
                        <h3>¡Compra realizada con éxito!</h3>
                        <p>Gracias por tu compra en Tienda NBA. En breve recibirás el detalle de tu pedido.</p>
                        <div className="cart-empty-actions">
                            <button
                                type="button"
                                className="btn-cart-action"
                                onClick={() => {
                                    setCheckoutSuccess(false);
                                    navigate('/productos');
                                }}
                            >
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="cart-empty-state">
                        <h2>Tu carrito está vacío</h2>
                        <p>Agregá productos desde el catálogo para verlos aquí.</p>
                        <div className="cart-empty-actions">
                            <Link to="/productos" className="btn-cart-action">
                                Ir a la tienda
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="cart-items-container">
                            {filteredItems.length === 0 ? (
                                <div className="cart-no-results">
                                    <p>No se encontraron productos en tu carrito para &ldquo;{searchTerm}&rdquo;.</p>
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const imgSrc = imagenesProductos[item.nombre?.trim()] || item.imagen;
                                    const showImage = imgSrc && !failedImages[item.id];

                                    return (
                                        <div key={item.id} className="cart-item-row">
                                            <div className="cart-item">
                                                <div className="item-image-placeholder">
                                                    {showImage && (
                                                        <img
                                                            src={imgSrc}
                                                            alt={item.nombre}
                                                            onError={() =>
                                                                setFailedImages((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: true
                                                                }))
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div className="item-details">
                                                    <h3>{item.nombre}</h3>
                                                    <p>{item.descripcion || 'Descripción'}</p>
                                                    <span className="item-unit-price">
                                                        {formatPrice(item.precio)}
                                                    </span>
                                                </div>

                                                <div className="item-quantity-wrapper">
                                                    <div className="item-quantity">
                                                        <button
                                                            type="button"
                                                            aria-label="Disminuir cantidad"
                                                            onClick={() =>
                                                                handleQuantityChange(item.id, item.cantidad - 1)
                                                            }
                                                        >
                                                            -
                                                        </button>
                                                        <span>{item.cantidad}</span>
                                                        <button
                                                            type="button"
                                                            aria-label="Aumentar cantidad"
                                                            onClick={() =>
                                                                handleQuantityChange(item.id, item.cantidad + 1)
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="item-right-column">
                                                    <div className="item-subtotal">
                                                        {formatPrice(Number(item.precio || 0) * Number(item.cantidad || 0))}
                                                    </div>

                                                    <div className="item-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-eliminar"
                                                            onClick={() => setItemToDelete(item.id)}
                                                        >
                                                            Eliminar
                                                        </button>

                                                        {itemToDelete === item.id && (
                                                            <div
                                                                className="delete-popover"
                                                                role="dialog"
                                                                aria-label="Confirmar eliminación"
                                                            >
                                                                <p>¿Eliminar este producto?</p>
                                                                <div className="modal-buttons">
                                                                    <button
                                                                        type="button"
                                                                        className="btn-confirm-yes"
                                                                        onClick={handleConfirmDelete}
                                                                    >
                                                                        Si
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-confirm-no"
                                                                        onClick={() => setItemToDelete(null)}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="cart-summary-section">
                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Envio</span>
                                    <span>{formatPrice(envio)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Descuentos</span>
                                    <span>{formatPrice(descuentos)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="cart-total-section">
                            <div className="cart-total">
                                <h2>Total</h2>
                                <h2>{formatPrice(total)}</h2>
                            </div>

                            <div className="cart-buttons">
                                <button
                                    type="button"
                                    className="btn-cart-action"
                                    onClick={handleClearCart}
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="button"
                                    className="btn-cart-action"
                                    onClick={handleCheckout}
                                >
                                    Check Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Newsletter + Footer igual al Mockup */}
            <div className="cart-bottom-sections">
                <div className="cart-newsletter-band">
                    <section className="nba-newsletter">
                        <div>
                            <h2>✉ SUSCRIBITE A NUESTRO NEWSLETTER</h2>
                            <p>Recibí ofertas exclusivas, lanzamientos y novedades.</p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Tu correo electrónico..." required />
                            <button type="submit">Suscribirme</button>
                        </form>
                    </section>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Cart;
