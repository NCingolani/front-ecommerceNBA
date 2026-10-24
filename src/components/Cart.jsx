import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../store/slices/cartSlice'; // Ajustá la ruta a tu slice
import './Cart.css'; // Usaremos el CSS del mockup

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Obtenemos los items desde el store global de Redux
    const cartItems = useSelector((store) => store.cart.items);

    const [itemToDelete, setItemToDelete] = useState(null);

    // Cálculos dinámicos
    const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const envio = 1500;
    const descuentos = 0;
    const total = subtotal + envio - descuentos;

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            dispatch(removeFromCart(itemToDelete));
            setItemToDelete(null);
        }
    };

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity > 0) {
            dispatch(updateQuantity({ id, quantity: newQuantity }));
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Carrito</h1>
                <div className="cart-search">
                    <label>Busqueda</label>
                    <input type="text" placeholder="Busqueda 🔍" />
                </div>
            </div>

            {cartItems.length > 0 && (
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                    Tienes {cartItems.length} productos en tu carrito.
                </p>
            )}

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <h2>Tu carrito está vacío</h2>
                    <Link to="/" className="btn-solid" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
                        Ir a la tienda
                    </Link>
                </div>
            ) : (
                <>
                    <div className="cart-items-container">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image-placeholder">
                                    {item.imagen && <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>

                                <div className="item-details">
                                    <h3>{item.nombre}</h3>
                                    <p>{item.descripcion}</p>
                                    <span className="item-unit-price">${item.precio.toLocaleString('es-AR')}</span>
                                </div>

                                <div className="item-quantity">
                                    <button onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}>-</button>
                                    <span>{item.cantidad}</span>
                                    <button onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}>+</button>
                                </div>

                                <div className="item-subtotal">
                                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                                </div>

                                <div className="item-actions">
                                    <button className="btn-eliminar" onClick={() => setItemToDelete(item.id)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Envio</span>
                            <span>${envio.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Descuentos</span>
                            <span>${descuentos.toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    <div className="cart-total">
                        <h2>Total</h2>
                        <h2>${total.toLocaleString('es-AR')}</h2>
                    </div>

                    <div className="cart-buttons">
                        <button className="btn-outline" onClick={handleClearCart}>Limpiar</button>
                        <button className="btn-solid" onClick={() => navigate('/checkout')}>Check Out</button>
                    </div>
                </>
            )}

            {/* Modal flotante de Confirmación (Mockup) */}
            {itemToDelete && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal">
                        <p>¿Eliminar este producto?</p>
                        <div className="modal-buttons">
                            <button className="btn-outline btn-sm" onClick={handleConfirmDelete}>Si</button>
                            <button className="btn-outline btn-sm btn-danger" onClick={() => setItemToDelete(null)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;