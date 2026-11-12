
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// CATEGORÍAS DISPONIBLES
const CATEGORIAS = [
  'Jersey',
  'Shorts',
  'Zapatillas',
  'Accesorios'
];

// TALLES DISPONIBLES
const TALLES = [
  'S', 'M', 'L', 'XL', 'XXL',
  '40', '42', '44', 'Único'
];

// NORMALIZAR CATEGORÍAS ANTIGUAS
const normalizarCategoria = (categoria) => {
  const valor = String(categoria || '').trim();

  if (
    ['camiseta', 'camisetas', 'jerseys', 'jersey']
      .includes(valor.toLowerCase())
  ) {
    return 'Jersey';
  }

  return valor || 'Jersey';
};

const ProductCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  // DETECTAR CREACIÓN O EDICIÓN
  const esEdicion = Boolean(id);

  // DATOS DEL PRODUCTO
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [nombreCategoria, setNombreCategoria] =
    useState('Jersey');

  const [talle, setTalle] = useState('L');
  const [stock, setStock] = useState('15');
  const [descripcion, setDescripcion] = useState('');

  const [etiquetasInput, setEtiquetasInput] = useState(
    'Oficial NBA, Novedad'
  );

  // IMÁGENES
  const [imagenActual, setImagenActual] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [vistaPreviaArchivo, setVistaPreviaArchivo] =
    useState('');

  const [errorImagen, setErrorImagen] = useState(false);

  // ESTADOS DEL FORMULARIO
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);

  const [estado, setEstado] = useState({
    tipo: '',
    texto: ''
  });

  // ======================================
  // CARGAR PRODUCTO PARA EDITAR
  // ======================================

  useEffect(() => {
    if (!esEdicion) {
      setCargando(false);
      return;
    }

    const controller = new AbortController();

    const cargarProducto = async () => {
      setCargando(true);
      setErrorCarga(false);
      setEstado({ tipo: '', texto: '' });

      try {
        const response = await fetch(
          `/api/productos/${id}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar el producto. HTTP ${response.status}`
          );
        }

        const producto = await response.json();

        // CARGAR DATOS EXISTENTES
        setNombre(producto.nombre || '');

        setPrecio(
          producto.precio != null
            ? String(producto.precio)
            : ''
        );

        setDescripcion(producto.descripcion || '');

        setNombreCategoria(
          normalizarCategoria(producto.nombreCategoria)
        );

        setTalle(producto.talle || 'L');

        setStock(
          producto.stock != null
            ? String(producto.stock)
            : '0'
        );

        setEtiquetasInput(
          Array.isArray(producto.etiquetas)
            ? producto.etiquetas.join(', ')
            : ''
        );

        // CONSERVAR IMAGEN GUARDADA EN MYSQL
        setImagenActual(producto.imagen || '');

        setArchivoImagen(null);
        setErrorImagen(false);

      } catch (error) {
        if (error.name !== 'AbortError') {
          setErrorCarga(true);

          setEstado({
            tipo: 'error',
            texto: error.message
          });
        }

      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarProducto();

    return () => controller.abort();

  }, [id, esEdicion]);

  // ======================================
  // VISTA PREVIA DE IMAGEN LOCAL
  // ======================================

  useEffect(() => {
    if (!archivoImagen) {
      setVistaPreviaArchivo('');
      return;
    }

    const urlTemporal = URL.createObjectURL(archivoImagen);

    setVistaPreviaArchivo(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };

  }, [archivoImagen]);

  // IMAGEN QUE SE MOSTRARÁ
  const imagenPreview = vistaPreviaArchivo || imagenActual;

  // ======================================
  // SELECCIONAR IMAGEN DESDE WINDOWS
  // ======================================

  const handleArchivoSeleccionado = (event) => {
    const archivo = event.target.files?.[0];

    setEstado({ tipo: '', texto: '' });

    if (!archivo) {
      setArchivoImagen(null);
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      setArchivoImagen(null);
      event.target.value = '';

      setEstado({
        tipo: 'error',
        texto: 'Seleccioná una imagen JPG, PNG o WebP.'
      });

      return;
    }

    const tamañoMaximo = 5 * 1024 * 1024;

    if (archivo.size > tamañoMaximo) {
      setArchivoImagen(null);
      event.target.value = '';

      setEstado({
        tipo: 'error',
        texto: 'La imagen no puede superar los 5 MB.'
      });

      return;
    }

    setArchivoImagen(archivo);
    setErrorImagen(false);
  };

  // ======================================
  // CREAR O MODIFICAR PRODUCTO
  // ======================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enviando || cargando || errorCarga) return;

    setEstado({ tipo: '', texto: '' });

    // VALIDAR CAMPOS ANTES DE SUBIR LA IMAGEN
    if (!nombre.trim()) {
      setEstado({
        tipo: 'error',
        texto: 'Ingresá el nombre del producto.'
      });
      return;
    }

    if (!descripcion.trim()) {
      setEstado({
        tipo: 'error',
        texto: 'Ingresá una descripción.'
      });
      return;
    }

    const precioNumerico = Number(precio);
    const stockNumerico = Number(stock);

    if (
      precio.trim() === '' ||
      !Number.isFinite(precioNumerico) ||
      precioNumerico < 0
    ) {
      setEstado({
        tipo: 'error',
        texto: 'Ingresá un precio válido.'
      });
      return;
    }

    if (
      stock.trim() === '' ||
      !Number.isInteger(stockNumerico) ||
      stockNumerico < 0
    ) {
      setEstado({
        tipo: 'error',
        texto: 'Ingresá un stock válido.'
      });
      return;
    }

    // LA IMAGEN ES OBLIGATORIA AL CREAR.
    // AL EDITAR PUEDE CONSERVARSE LA EXISTENTE.
    if (!archivoImagen && !imagenActual) {
      setEstado({
        tipo: 'error',
        texto: 'Seleccioná una imagen para el producto.'
      });
      return;
    }

    const token =
      session?.token || localStorage.getItem('token');

    if (!token) {
      setEstado({
        tipo: 'error',
        texto: 'Tenés que iniciar sesión como ADMIN.'
      });
      return;
    }

    setEnviando(true);

    try {
      // CONSERVAR IMAGEN EXISTENTE
      let urlImagen = imagenActual;

      // SUBIR UNA NUEVA IMAGEN SOLO SI FUE SELECCIONADA
      if (archivoImagen) {
        const formData = new FormData();

        formData.append('archivo', archivoImagen);

        const respuestaImagen = await fetch(
          '/api/productos/imagen',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          }
        );

        if (!respuestaImagen.ok) {
          throw new Error(
            `No se pudo subir la imagen. HTTP ${respuestaImagen.status}`
          );
        }

        const resultadoImagen =
          await respuestaImagen.json();

        if (!resultadoImagen.url) {
          throw new Error(
            'El servidor no devolvió la URL de la imagen.'
          );
        }

        urlImagen = resultadoImagen.url;
      }

      // PREPARAR ETIQUETAS
      const etiquetas = etiquetasInput
        .split(',')
        .map((etiqueta) => etiqueta.trim())
        .filter(Boolean);

      // OBJETO PRODUCTO
      const datosProducto = {
        nombre: nombre.trim(),
        precio: precioNumerico,
        descripcion: descripcion.trim(),
        nombreCategoria,
        talle,
        stock: stockNumerico,
        imagen: urlImagen,
        etiquetas
      };

      // SELECCIONAR MÉTODO HTTP
      const metodo = esEdicion ? 'PUT' : 'POST';

      const url = esEdicion
        ? `/api/productos/${id}`
        : '/api/productos';

      // GUARDAR PRODUCTO EN MYSQL
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(datosProducto)
      });

      if (!response.ok) {
        throw new Error(
          `No se pudo ${esEdicion ? 'modificar' : 'crear'} el producto. HTTP ${response.status}`
        );
      }

      // OPERACIÓN EXITOSA
      setEstado({
        tipo: 'exito',
        texto: esEdicion
          ? '¡Producto actualizado correctamente!'
          : '¡Producto publicado correctamente!'
      });

      // REGRESAR AL CATÁLOGO
      navigate('/productos');

    } catch (error) {
      console.error('Error al guardar producto:', error);

      setEstado({
        tipo: 'error',
        texto: error.message
      });

    } finally {
      setEnviando(false);
    }
  };

  // ======================================
  // PANTALLA DE CARGA
  // ======================================

  if (cargando) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ padding: '30px' }}>
            Cargando información del producto...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // FORMULARIO
  // ======================================

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>
              PANEL ADMIN
            </span>

            <h2 style={styles.title}>
              {esEdicion
                ? 'Modificar Producto'
                : 'Publicar Nuevo Producto'}
            </h2>

            <p style={styles.subtitle}>
              {esEdicion
                ? 'Modificá los datos del producto seleccionado'
                : 'Completá los datos técnicos y seleccioná una imagen'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/productos')}
            style={styles.backBtn}
          >
            ← Catálogo
          </button>
        </div>

        {/* MENSAJES */}
        {estado.texto && (
          <div
            role={estado.tipo === 'error' ? 'alert' : 'status'}
            style={{
              ...styles.alert,
              backgroundColor:
                estado.tipo === 'exito'
                  ? '#ecfdf5'
                  : '#fef2f2',
              borderColor:
                estado.tipo === 'exito'
                  ? '#10b981'
                  : '#ef4444',
              color:
                estado.tipo === 'exito'
                  ? '#065f46'
                  : '#991b1b'
            }}
          >
            {estado.texto}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={styles.formGrid}
        >

          {/* COLUMNA IZQUIERDA */}
          <div style={styles.leftColumn}>

            {/* NOMBRE */}
            <div style={styles.fieldGroup}>
              <label
                htmlFor="nombreProducto"
                style={styles.label}
              >
                Nombre del producto *
              </label>

              <input
                id="nombreProducto"
                type="text"
                placeholder="Ej: Jersey Anthony Edwards #5 Timberwolves"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={errorCarga}
                style={styles.input}
              />
            </div>

            {/* PRECIO Y CATEGORÍA */}
            <div style={styles.row2Cols}>

              <div style={styles.fieldGroup}>
                <label
                  htmlFor="precioProducto"
                  style={styles.label}
                >
                  Precio (ARS) *
                </label>

                <input
                  id="precioProducto"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="120000"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  disabled={errorCarga}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label
                  htmlFor="categoriaProducto"
                  style={styles.label}
                >
                  Categoría *
                </label>

                <select
                  id="categoriaProducto"
                  value={nombreCategoria}
                  onChange={(e) =>
                    setNombreCategoria(e.target.value)
                  }
                  disabled={errorCarga}
                  style={styles.input}
                >
                  {[...new Set([
                    ...CATEGORIAS,
                    nombreCategoria
                  ])].map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* TALLE Y STOCK */}
            <div style={styles.row2Cols}>

              <div style={styles.fieldGroup}>
                <label
                  htmlFor="talleProducto"
                  style={styles.label}
                >
                  Talle *
                </label>

                <select
                  id="talleProducto"
                  value={talle}
                  onChange={(e) =>
                    setTalle(e.target.value)
                  }
                  disabled={errorCarga}
                  style={styles.input}
                >
                  {[...new Set([...TALLES, talle])].map(
                    (valor) => (
                      <option
                        key={valor}
                        value={valor}
                      >
                        {valor}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label
                  htmlFor="stockProducto"
                  style={styles.label}
                >
                  Stock disponible *
                </label>

                <input
                  id="stockProducto"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="15"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  required
                  disabled={errorCarga}
                  style={styles.input}
                />
              </div>

            </div>

            {/* ETIQUETAS */}
            <div style={styles.fieldGroup}>
              <label
                htmlFor="etiquetasProducto"
                style={styles.label}
              >
                Etiquetas (separadas por coma)
              </label>

              <input
                id="etiquetasProducto"
                type="text"
                placeholder="Ej: Novedad, Edición Limitada"
                value={etiquetasInput}
                onChange={(e) =>
                  setEtiquetasInput(e.target.value)
                }
                disabled={errorCarga}
                style={styles.input}
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div style={styles.fieldGroup}>
              <label
                htmlFor="descripcionProducto"
                style={styles.label}
              >
                Descripción *
              </label>

              <textarea
                id="descripcionProducto"
                rows="4"
                placeholder="Detalles de confección, tela Dri-FIT, licencia oficial..."
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(e.target.value)
                }
                required
                disabled={errorCarga}
                style={{
                  ...styles.input,
                  resize: 'vertical'
                }}
              />
            </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div style={styles.rightColumn}>

            {/* SELECCIONAR ARCHIVO */}
            <div style={styles.fieldGroup}>
              <label
                htmlFor="archivoProducto"
                style={styles.label}
              >
                {esEdicion
                  ? 'Cambiar imagen del producto'
                  : 'Imagen del producto *'}
              </label>

              <input
                id="archivoProducto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleArchivoSeleccionado}
                disabled={enviando || errorCarga}
                style={styles.input}
              />

              {archivoImagen && (
                <p style={styles.fileInfo}>
                  ✓ Imagen seleccionada: {archivoImagen.name}
                </p>
              )}

              <p style={styles.helpText}>
                Formatos permitidos: JPG, PNG y WebP.
                Tamaño máximo: 5 MB.
              </p>

              {esEdicion && imagenActual && !archivoImagen && (
                <p style={styles.helpText}>
                  Se conservará la imagen actual si no
                  seleccionás otra.
                </p>
              )}

              {esEdicion && !imagenActual && (
                <p style={styles.helpText}>
                  Este producto no tiene una imagen guardada
                  en MySQL. Seleccioná una para actualizarlo.
                </p>
              )}
            </div>

            {/* VISTA PREVIA */}
            <div style={styles.previewBox}>

              <span style={styles.previewTag}>
                Vista previa de tarjeta
              </span>

              {imagenPreview && !errorImagen ? (
                <img
                  key={imagenPreview}
                  src={imagenPreview}
                  alt="Vista previa del producto"
                  style={styles.previewImg}
                  onError={() => setErrorImagen(true)}
                />
              ) : (
                <div style={styles.noImage}>
                  <p>
                    {errorImagen
                      ? 'No se pudo mostrar la imagen.'
                      : 'Sin imagen seleccionada'}
                  </p>
                </div>
              )}

              <div style={styles.previewMeta}>

                <strong style={styles.previewName}>
                  {nombre || 'Nombre del producto'}
                </strong>

                <span style={styles.previewPrice}>
                  $
                  {Number(precio || 0).toLocaleString(
                    'es-AR'
                  )}
                </span>

              </div>
            </div>

            {/* BOTONES */}
            <div style={styles.buttonGroup}>

              <button
                type="submit"
                disabled={enviando || errorCarga}
                style={{
                  ...styles.submitBtn,
                  opacity:
                    enviando || errorCarga ? 0.6 : 1
                }}
              >
                {enviando
                  ? 'Guardando...'
                  : esEdicion
                    ? '✓ Guardar cambios'
                    : '✓ Publicar Producto'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/productos')}
                disabled={enviando}
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

// ======================================
// ESTILOS DEL FORMULARIO
// ======================================

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: '960px',
    margin: '20px auto 50px',
    padding: '0 16px',
    boxSizing: 'border-box'
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
    overflow: 'hidden',
    color: '#1e293b'
  },

  header: {
    background:
      'linear-gradient(135deg, #081522 0%, #1d428a 100%)',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: '28px',
    padding: '30px 32px'
  },

  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0
  },

  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0
  },

  row2Cols: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px'
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
    minWidth: 0
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
    outline: 'none',
    boxSizing: 'border-box'
  },

  fileInfo: {
    color: '#059669',
    fontSize: '0.85rem',
    fontWeight: '600',
    margin: '4px 0'
  },

  helpText: {
    color: '#64748b',
    fontSize: '0.8rem',
    margin: '4px 0'
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
    padding: '8px',
    boxSizing: 'border-box'
  },

  noImage: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '35px 0'
  },

  previewMeta: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '10px'
  },

  previewName: {
    color: '#0f172a',
    fontSize: '1rem',
    overflowWrap: 'anywhere'
  },

  previewPrice: {
    color: '#1d428a',
    fontWeight: '800',
    fontSize: '1.15rem',
    whiteSpace: 'nowrap'
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
