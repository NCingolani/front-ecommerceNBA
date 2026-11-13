import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../store/slices/cartSlice';
import { useAuth } from '../auth/AuthContext';
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
    const { session } = useAuth();

    const cartItems = useSelector((store) => store.cart.items);

    const [itemToDelete, setItemToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [navSearch, setNavSearch] = useState('');
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [failedImages, setFailedImages] = useState({});
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    // Estados para el modal de Tarjeta de Crédito
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cardData, setCardData] = useState({
        titular: '',
        numero: '',
        vencimiento: '',
        cvv: ''
    });
    const [cardError, setCardError] = useState('');

    const filteredItems = cartItems.filter((item) => {
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase().trim();
        const nombre = String(item.nombre || '').toLowerCase();
        const descripcion = String(item.descripcion || '').toLowerCase();
        return nombre.includes(query) || descripcion.includes(query);
    });

    const totalCount = cartItems.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

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

    const handleQuantityChange = (item, newQuantity) => {
        const stockDisponible = Number(item.stock ?? 99);
        if (newQuantity > stockDisponible) {
            setCheckoutError(`No podés agregar más de ${stockDisponible} unidades de "${item.nombre}" (stock máximo disponible).`);
            return;
        }
        setCheckoutError('');
        if (newQuantity > 0) {
            dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
        } else {
            setItemToDelete(item.id);
        }
    };

    // Paso 1: Al tocar "Check Out", validamos sesión y stock y abrimos el modal de tarjeta
    const handleOpenPaymentModal = () => {
        if (cartItems.length === 0 || checkoutLoading) return;
        setCheckoutError('');
        setCardError('');

        const token = session?.token || localStorage.getItem('token');
        if (!token) {
            setCheckoutError('Debés iniciar sesión para finalizar la compra.');
            navigate('/login');
            return;
        }

        const itemSinStock = cartItems.find(
            (item) => item.stock !== undefined && Number(item.cantidad) > Number(item.stock)
        );
        if (itemSinStock) {
            setCheckoutError(`Stock insuficiente para "${itemSinStock.nombre}". Disponibles: ${itemSinStock.stock}.`);
            return;
        }

        setShowPaymentModal(true);
    };

    // Formateo de inputs de tarjeta
    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardError('');

        if (name === 'numero') {
            const digits = value.replace(/\D/g, '').slice(0, 16);
            setCardData((prev) => ({ ...prev, numero: digits }));
            return;
        }
        if (name === 'cvv') {
            const digits = value.replace(/\D/g, '').slice(0, 4);
            setCardData((prev) => ({ ...prev, cvv: digits }));
            return;
        }
        if (name === 'vencimiento') {
            let cleaned = value.replace(/\D/g, '').slice(0, 4);
            if (cleaned.length >= 3) {
                cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
            }
            setCardData((prev) => ({ ...prev, vencimiento: cleaned }));
            return;
        }
        setCardData((prev) => ({ ...prev, [name]: value }));
    };

    // Paso 2: Validar datos obligatorios de tarjeta y registrar el pedido en el backend
    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        if (checkoutLoading) return;

        if (!cardData.titular.trim()) {
            setCardError('El nombre del titular es obligatorio.');
            return;
        }
        if (cardData.numero.length !== 16) {
            setCardError('El número de tarjeta debe tener exactamente 16 dígitos.');
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.vencimiento)) {
            setCardError('Ingresá una fecha de vencimiento válida (MM/AA).');
            return;
        }
        if (cardData.cvv.length < 3) {
            setCardError('El código de seguridad (CVV) debe tener 3 o 4 dígitos.');
            return;
        }

        setCheckoutLoading(true);
        setCardError('');
        setCheckoutError('');

        try {
            const token = session?.token || localStorage.getItem('token');

            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    productos: cartItems.map((item) => ({
                        productoId: item.id,
                        cantidad: Number(item.cantidad)
                    }))
                })
            });

            if (!response.ok) {
                let errorMsg = `No se pudo registrar la compra (HTTP ${response.status}).`;
                try {
                    const errData = await response.json();
                    if (errData?.message) errorMsg = errData.message;
                } catch (_) {
                    // Si no viene JSON, usamos mensaje por defecto
                }
                if (response.status === 409) {
                    errorMsg = 'Uno o más productos no tienen stock suficiente para completar la compra.';
                }
                throw new Error(errorMsg);
            }

            dispatch(clearCart());
            setShowPaymentModal(false);
            setCardData({ titular: '', numero: '', vencimiento: '', cvv: '' });
            setCheckoutSuccess(true);

        } catch (error) {
            setCardError(error.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleNavSearchSubmit = (e) => {
        e.preventDefault();
        navigate('/productos');
    };

    const formatPrice = (value) => `$ ${Number(value || 0).toLocaleString('es-AR')}`;

    return (
        <div className="cart-wrapper">
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

                {checkoutError && (
                    <div
                        role="alert"
                        style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            padding: '12px 18px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontWeight: 'bold'
                        }}
                    >
                        ⚠️ {checkoutError}
                    </div>
                )}

                {checkoutSuccess ? (
                    <div className="cart-checkout-banner" role="status">
                        <h3>¡Pago aprobado y compra realizada con éxito!</h3>
                        <p>El stock fue descontado y tu pedido ya está registrado en tu cuenta.</p>
                        <div className="cart-empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn-cart-action"
                                onClick={() => {
                                    setCheckoutSuccess(false);
                                    navigate('/mis-pedidos');
                                }}
                            >
                                Ver Mis Pedidos
                            </button>
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
                                    const maxStock = Number(item.stock ?? 99);

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
                                                                handleQuantityChange(item, item.cantidad - 1)
                                                            }
                                                        >
                                                            -
                                                        </button>
                                                        <span>{item.cantidad}</span>
                                                        <button
                                                            type="button"
                                                            aria-label="Aumentar cantidad"
                                                            disabled={item.cantidad >= maxStock}
                                                            onClick={() =>
                                                                handleQuantityChange(item, item.cantidad + 1)
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
                                    onClick={handleOpenPaymentModal}
                                >
                                    Check Out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL DE SIMULACIÓN DE TARJETA DE CRÉDITO */}
            {showPaymentModal && (
                <div style={modalStyles.overlay} role="dialog" aria-modal="true">
                    <div style={modalStyles.modal}>
                        <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a' }}>
                            💳 Datos de Pago
                        </h2>
                        <p style={{ marginTop: 0, marginBottom: '16px', color: '#475569' }}>
                            Total a abonar: <strong>{formatPrice(total)}</strong>
                        </p>

                        {cardError && (
                            <div style={modalStyles.errorBox} role="alert">
                                {cardError}
                            </div>
                        )}

                        <form onSubmit={handleConfirmPayment} style={modalStyles.form}>
                            <label style={modalStyles.label}>
                                Nombre del Titular (como figura en la tarjeta) *
                                <input
                                    type="text"
                                    name="titular"
                                    placeholder="Ej: NAHUEL CINGOLANI"
                                    value={cardData.titular}
                                    onChange={handleCardChange}
                                    required
                                    style={modalStyles.input}
                                />
                            </label>

                            <label style={modalStyles.label}>
                                Número de Tarjeta (16 dígitos) *
                                <input
                                    type="text"
                                    name="numero"
                                    placeholder="4509123456789012"
                                    maxLength={16}
                                    value={cardData.numero}
                                    onChange={handleCardChange}
                                    required
                                    style={modalStyles.input}
                                />
                            </label>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ ...modalStyles.label, flex: 1 }}>
                                    Vencimiento (MM/AA) *
                                    <input
                                        type="text"
                                        name="vencimiento"
                                        placeholder="12/28"
                                        maxLength={5}
                                        value={cardData.vencimiento}
                                        onChange={handleCardChange}
                                        required
                                        style={modalStyles.input}
                                    />
                                </label>

                                <label style={{ ...modalStyles.label, flex: 1 }}>
                                    CVV *
                                    <input
                                        type="password"
                                        name="cvv"
                                        placeholder="123"
                                        maxLength={4}
                                        value={cardData.cvv}
                                        onChange={handleCardChange}
                                        required
                                        style={modalStyles.input}
                                    />
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button
                                    type="submit"
                                    disabled={checkoutLoading}
                                    style={{
                                        ...modalStyles.btnPay,
                                        opacity: checkoutLoading ? 0.6 : 1
                                    }}
                                >
                                    {checkoutLoading ? 'Procesando pago...' : 'Finalizar Compra'}
                                </button>

                                <button
                                    type="button"
                                    disabled={checkoutLoading}
                                    onClick={() => setShowPaymentModal(false)}
                                    style={modalStyles.btnCancel}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '16px',
        boxSizing: 'border-box'
    },
    modal: {
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '24px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '0.85rem',
        fontWeight: 'bold'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: '#1e293b'
    },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '0.95rem',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        width: '100%',
        boxSizing: 'border-box'
    },
    btnPay: {
        flex: 1,
        backgroundColor: '#1D428A',
        color: '#ffffff',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.95rem'
    },
    btnCancel: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        color: '#0f172a',
        border: 'none',
        padding: '12px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '0.95rem'
    }
};

export default Cart;
