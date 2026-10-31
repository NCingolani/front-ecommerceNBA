import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const IMAGENES_PREDEFINIDAS = [
    { label: 'Jersey LeBron James (Lakers)', url: '/Images/Productos/JerseyLeBronJames.jpg' },
    { label: 'Jersey Stephen Curry (Warriors)', url: '/Images/Productos/JerseyStephenCurry.jpg' },
    { label: 'Zapatillas Nike Luka 2', url: '/Images/Productos/ZapatillasNikeLuka2.jpg' },
    { label: 'Otra imagen (Escribir ruta o URL)', url: 'custom' }
];

const CATEGORIAS = ['Camisetas', 'Shorts', 'Zapatillas', 'Accesorios'];
const TALLES = ['S', 'M', 'L', 'XL', 'XXL', '40', '42', '44', 'Único'];

const ProductCreate = () => {
    const { session } = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [nombreCategoria, setNombreCategoria] = useState('Camisetas');
    const [talle, setTalle] = useState('L');
    const [stock, setStock] = useState('15');
    const [descripcion, setDescripcion] = useState('');
    const [opcionImagen, setOpcionImagen] = useState(IMAGENES_PREDEFINIDAS[0].url);
    const [customImagen, setCustomImagen] = useState('');
    const [etiquetasInput, setEtiquetasInput] = useState('Oficial NBA, Novedad');

    const [estado, setEstado] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);

    const imagenFinal = opcionImagen === 'custom' ? customImagen : opcionImagen;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setEstado({ tipo: '', texto: '' });

        const etiquetas = etiquetasInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        const nuevoProducto = {
            nombre: nombre.trim(),
            precio: parseFloat(precio),
            descripcion: descripcion.trim(),
            nombreCategoria,
            talle,
            stock: parseInt(stock, 10) || 0,
            imagen: imagenFinal || '/Images/Productos/JerseyLeBronJames.jpg',
            etiquetas
        };

        const token = session?.token || localStorage.getItem('token');

        try {
            const response = await fetch('/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(nuevoProducto)
            });

            if (!response.ok) {
                throw new Error('No se pudo crear el producto. Verificá que tu sesión de ADMIN siga activa.');
            }

            setEstado({ tipo: 'exito', texto: '¡Producto publicado correctamente en el catálogo!' });
            setNombre('');
            setPrecio('');
            setDescripcion('');
            setTimeout(() => navigate('/productos'), 1100);
        } catch (error) {
            setEstado({ tipo: 'error', texto: error.message });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                {/* ENCABEZADO ESTILO NBA */}
                <div style={styles.header}>
                    <div>
                        <span style={styles.badge}>PANEL ADMIN</span>
                        <h2 style={styles.title}>Publicar Nuevo Producto</h2>
                        <p style={styles.subtitle}>Completá los datos técnicos y asigná la imagen del catálogo</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/productos')}
                        style={styles.backBtn}
                    >
                        ← Catálogo
                    </button>
                </div>

                {estado.texto && (
                    <div
                        style={{
                            ...styles.alert,
                            backgroundColor: estado.tipo === 'exito' ? '#ecfdf5' : '#fef2f2',
                            borderColor: estado.tipo === 'exito' ? '#10b981' : '#ef4444',
                            color: estado.tipo === 'exito' ? '#065f46' : '#991b1b'
                        }}
                    >
                        {estado.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.formGrid}>
                    {/* COLUMNA IZQUIERDA: CAMPOS DE DATOS */}
                    <div style={styles.leftColumn}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Nombre del producto *</label>
                            <input
                                type="text"
                                placeholder="Ej: Jersey Anthony Edwards #5 Timberwolves"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.row2Cols}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Precio (ARS) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="120000"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Categoría *</label>
                                <select
                                    value={nombreCategoria}
                                    onChange={(e) => setNombreCategoria(e.target.value)}
                                    style={styles.input}
                                >
                                    {CATEGORIAS.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.row2Cols}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Talle *</label>
                                <select
                                    value={talle}
                                    onChange={(e) => setTalle(e.target.value)}
                                    style={styles.input}
                                >
                                    {TALLES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Stock disponible *</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="15"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Etiquetas (separadas por coma)</label>
                            <input
                                type="text"
                                placeholder="Ej: Novedad, Edición Limitada, Oferta"
                                value={etiquetasInput}
                                onChange={(e) => setEtiquetasInput(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Descripción *</label>
                            <textarea
                                rows="4"
                                placeholder="Detalles de confección, tela Dri-FIT, licencia oficial..."
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                style={{ ...styles.input, resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: IMAGEN Y PREVIEW */}
                    <div style={styles.rightColumn}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Imagen del Producto *</label>
                            <select
                                value={opcionImagen}
                                onChange={(e) => setOpcionImagen(e.target.value)}
                                style={styles.input}
                            >
                                {IMAGENES_PREDEFINIDAS.map((img) => (
                                    <option key={img.label} value={img.url}>
                                        {img.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {opcionImagen === 'custom' && (
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Ruta local o URL de la imagen</label>
                                <input
                                    type="text"
                                    placeholder="/Images/Productos/miFoto.jpg o https://..."
                                    value={customImagen}
                                    onChange={(e) => setCustomImagen(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                        )}

                        <div style={styles.previewBox}>
                            <span style={styles.previewTag}>Vista previa de tarjeta</span>
                            {imagenFinal ? (
                                <img
                                    src={imagenFinal}
                                    alt="Vista previa"
                                    style={styles.previewImg}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sin imagen seleccionada</p>
                            )}
                            <div style={styles.previewMeta}>
                                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                                    {nombre || 'Nombre del producto'}
                                </strong>
                                <span style={{ color: '#1d428a', fontWeight: '800', fontSize: '1.15rem' }}>
                                    ${Number(precio || 0).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                type="submit"
                                disabled={enviando}
                                style={styles.submitBtn}
                            >
                                {enviando ? 'Guardando...' : '✓ Publicar Producto'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/productos')}
                                style={styles.cancelBtn}
                            >
                                Cancelar y volver
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        width: '100%',
        maxWidth: '960px',
        margin: '20px auto 50px',
        padding: '0 16px'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        color: '#1e293b'
    },
    header: {
        background: 'linear-gradient(135deg, #081522 0%, #1d428a 100%)',
        color: '#ffffff',
        padding: '26px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '4px solid #c9082a'
    },
    badge: {
        display: 'inline-block',
        backgroundColor: '#c9082a',
        color: '#ffffff',
        fontSize: '0.72rem',
        fontWeight: '800',
        padding: '4px 10px',
        borderRadius: '999px',
        letterSpacing: '0.08em',
        marginBottom: '8px'
    },
    title: {
        margin: 0,
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#ffffff'
    },
    subtitle: {
        margin: '4px 0 0',
        color: '#cbd5e1',
        fontSize: '0.92rem'
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.28)',
        borderRadius: '8px',
        padding: '9px 16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    alert: {
        margin: '20px 32px 0',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid',
        fontWeight: '600',
        fontSize: '0.95rem'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        padding: '30px 32px'
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    row2Cols: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        textAlign: 'left'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#334155',
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
    },
    input: {
        width: '100%',
        padding: '11px 13px',
        borderRadius: '8px',
        border: '1.5px solid #cbd5e1',
        fontSize: '0.95rem',
        color: '#0f172a',
        backgroundColor: '#f8fafc',
        outline: 'none'
    },
    previewBox: {
        flex: 1,
        minHeight: '240px',
        backgroundColor: '#f1f5f9',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    previewTag: {
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
    },
    previewImg: {
        width: '100%',
        maxHeight: '190px',
        objectFit: 'contain',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        padding: '8px'
    },
    previewMeta: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '10px'
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '4px'
    },
    submitBtn: {
        width: '100%',
        padding: '13px',
        backgroundColor: '#c9082a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '800',
        cursor: 'pointer'
    },
    cancelBtn: {
        width: '100%',
        padding: '11px',
        backgroundColor: 'transparent',
        color: '#1d428a',
        border: '2px solid #1d428a',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: '700',
        cursor: 'pointer'
    }
};

export default ProductCreate;