
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import './ProductList.css';

// NORMALIZAR TEXTO
const normalizar = (valor = '') =>
  String(valor ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

// CATEGORÍAS
const categorias = [
  'Jersey',
  'Shorts',
  'Zapatillas',
  'Accesorios'
];

// EQUIPOS
const equipos = [
  'Lakers',
  'Warriors',
  'Bulls',
  'Celtics',
  'Heat'
];

// NORMALIZAR NOMBRE DE CATEGORÍA
const normalizarCategoria = (valor) => {
  const categoria = normalizar(valor);

  if (
    categoria === 'camiseta' ||
    categoria === 'camisetas' ||
    categoria === 'jersey' ||
    categoria === 'jerseys'
  ) {
    return 'Jersey';
  }

  return categorias.find(
    (cat) => normalizar(cat) === categoria
  ) || valor;
};

// IDENTIFICAR EQUIPO
const obtenerEquipo = (producto) => {
  const nombre = normalizar(producto.nombre);

  return equipos.find((equipo) =>
    nombre.includes(normalizar(equipo))
  ) || '';
};

// IDENTIFICAR CATEGORÍA
const obtenerCategoria = (producto) => {
  const categoria = normalizar(producto.nombreCategoria);

  // Priorizar la categoría enviada por el backend
  if (categoria) {
    return normalizarCategoria(producto.nombreCategoria);
  }

  // Respaldo si el backend no envía categoría
  const nombre = normalizar(producto.nombre);

  if (
    nombre.includes('jersey') ||
    nombre.includes('camiseta')
  ) {
    return 'Jersey';
  }

  if (nombre.includes('short')) {
    return 'Shorts';
  }

  if (nombre.includes('zapatilla')) {
    return 'Zapatillas';
  }

  if (
    nombre.includes('gorra') ||
    nombre.includes('pelota')
  ) {
    return 'Accesorios';
  }

  return '';
};

// COMPONENTE PRINCIPAL
const ProductList = () => {
  const { agregarAlCarrito } = useCart();
  const { session } = useAuth();
  const esAdmin = session?.role === 'ADMIN';

  const [searchParams] = useSearchParams();
  const location = useLocation();

  const categoriaURL = normalizarCategoria(
    searchParams.get('categoria')?.trim() || ''
  );

  // PRODUCTOS
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // BÚSQUEDA Y ORDENAMIENTO
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('default');

  // FILTROS SELECCIONADOS
  const [categoriasSeleccionadas, setCategorias] = useState([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);

  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(null);

  // FILTROS APLICADOS
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    categorias: [],
    equipos: [],
    minimo: 0,
    maximo: null
  });

  // OBTENER O BUSCAR PRODUCTOS DESDE EL BACKEND
  const cargarProductos = (termino = '') => {
    const textoLimpio = termino.trim();

    const endpoint = textoLimpio
      ? `/api/productos/buscar?nombre=${encodeURIComponent(textoLimpio)}`
      : '/api/productos';

    setLoading(true);
    setError('');

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al obtener productos');
        }

        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);

        setError(
          'No se pudo cargar el catálogo. Intentá nuevamente más tarde.'
        );

        setLoading(false);
      });
  };

  // CARGA INICIAL, BÚSQUEDA DESDE OTRAS VISTAS Y CLIC EN "CATÁLOGO" EN EL NAVBAR
  useEffect(() => {
    const terminoInicial = searchParams.get('buscar')?.trim() || '';
    setBusqueda(terminoInicial);
    setCategorias([]);
    setEquiposSeleccionados([]);
    setPrecioMin(0);
    setPrecioMax(null);
    setFiltrosAplicados({
      categorias: [],
      equipos: [],
      minimo: 0,
      maximo: null
    });
    cargarProductos(terminoInicial);
  }, [location.key]);

  // EJECUTAR BÚSQUEDA AL PRESIONAR ENTER
  const handleBuscar = (e) => {
    e.preventDefault();
    cargarProductos(busqueda);
  };

  // ACTUALIZAR LISTADO AL ELIMINAR PRODUCTO
  const handleProductoEliminado = (idEliminado) => {
    setProductos((prev) =>
      prev.filter((p) => p.id !== idEliminado)
    );
  };


  const handleProductoActualizado = (productoActualizado) => {
    setProductos((prev) =>
      prev.map((producto) =>
        producto.id === productoActualizado.id
          ? productoActualizado
          : producto
      )
    );
  };


  // PRECIO MÁXIMO
  const precioTope = Math.max(
    100,
    Math.ceil(
      Math.max(
        ...productos.map((p) => Number(p.precio) || 0),
        0
      ) / 50
    ) * 50
  );

  const maxSeleccionado = precioMax ?? precioTope;

  // SELECCIONAR Y DESELECCIONAR FILTROS
  const toggleFiltro = (valor, seleccionados, setter) => {
    setter(
      seleccionados.includes(valor)
        ? seleccionados.filter((v) => v !== valor)
        : [...seleccionados, valor]
    );
  };

  // APLICAR FILTROS
  const aplicarFiltros = () => {
    setFiltrosAplicados({
      categorias: [...categoriasSeleccionadas],
      equipos: [...equiposSeleccionados],
      minimo: precioMin,
      maximo: precioMax
    });
  };

  // LIMPIAR FILTROS
  const limpiarFiltros = () => {
    setCategorias([]);
    setEquiposSeleccionados([]);
    setPrecioMin(0);
    setPrecioMax(null);
    setBusqueda('');

    setFiltrosAplicados({
      categorias: [],
      equipos: [],
      minimo: 0,
      maximo: null
    });

    cargarProductos('');
  };

  // FILTRADO COMBINADO (la búsqueda por nombre la resuelve el endpoint /api/productos/buscar)
  const productosFiltrados = productos.filter((producto) => {
    const categoriaProducto = obtenerCategoria(producto);
    const equipoProducto = obtenerEquipo(producto);
    const precioProducto = Number(producto.precio) || 0;

    // FILTRO POR URL
    const coincideURL =
      !categoriaURL ||
      normalizar(categoriaProducto) ===
        normalizar(categoriaURL);

    // FILTRO POR CATEGORÍA
    const coincideCategoria =
      filtrosAplicados.categorias.length === 0 ||
      filtrosAplicados.categorias.some(
        (cat) =>
          normalizar(cat) === normalizar(categoriaProducto)
      );

    // FILTRO POR EQUIPO
    const coincideEquipo =
      filtrosAplicados.equipos.length === 0 ||
      filtrosAplicados.equipos.includes(equipoProducto);

    // FILTRO POR PRECIO
    const coincidePrecio =
      precioProducto >= filtrosAplicados.minimo &&
      precioProducto <=
        (filtrosAplicados.maximo ?? precioTope);

    return (
      coincideURL &&
      coincideCategoria &&
      coincideEquipo &&
      coincidePrecio
    );
  });

  // ORDENAMIENTO
  const productosOrdenados = [...productosFiltrados];

  if (orden === 'menor') {
    productosOrdenados.sort(
      (a, b) => Number(a.precio) - Number(b.precio)
    );
  }

  if (orden === 'mayor') {
    productosOrdenados.sort(
      (a, b) => Number(b.precio) - Number(a.precio)
    );
  }

  if (orden === 'nombre') {
    productosOrdenados.sort((a, b) =>
      String(a.nombre).localeCompare(
        String(b.nombre),
        'es'
      )
    );
  }

  return (
    <main className="catalog-page">

      {/* ENCABEZADO */}
      <div className="catalog-heading">
        <div>
          <p>CATÁLOGO</p>
          <h1>{categoriaURL || 'Todos los productos'}</h1>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          {esAdmin && (
            <Link
              to="/crear"
              className="btn-onoff activo"
              style={{ textDecoration: 'none' }}
            >
              + Crear producto
            </Link>
          )}

          {categoriaURL && (
            <Link to="/productos">
              Ver todos los productos
            </Link>
          )}
        </div>
      </div>

      {/* BUSCADOR Y ORDENAMIENTO */}
      <div className="catalog-toolbar">

        <form
          className="catalog-search"
          onSubmit={handleBuscar}
        >
          <input
            type="search"
            placeholder="🔍 Buscar productos y presioná Enter... Ej: Lakers"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>

        <div className="catalog-sort">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="default">Ordenar por</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>

      </div>

      {/* CONTENEDOR DEL CATÁLOGO */}
      <div className="catalog-layout">

        {/* PANEL LATERAL DE FILTROS */}
        <aside className="catalog-sidebar">
          <h2>Filtros</h2>

          {/* CATEGORÍAS */}
          <section className="filter-section">
            <h3>Categoría</h3>

            {categorias.map((cat) => {
              const cantidad = productos.filter(
                (p) =>
                  normalizar(obtenerCategoria(p)) ===
                  normalizar(cat)
              ).length;

              return (
                <label
                  key={cat}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={categoriasSeleccionadas.includes(cat)}
                    onChange={() =>
                      toggleFiltro(
                        cat,
                        categoriasSeleccionadas,
                        setCategorias
                      )
                    }
                  />

                  <span>
                    {cat} ({cantidad})
                  </span>
                </label>
              );
            })}
          </section>

          {/* EQUIPOS */}
          <section className="filter-section">
            <h3>Equipos</h3>

            {equipos.map((equipo) => {
              const cantidad = productos.filter(
                (p) => obtenerEquipo(p) === equipo
              ).length;

              return (
                <label
                  key={equipo}
                  className="filter-option"
                >
                  <input
                    type="checkbox"
                    checked={equiposSeleccionados.includes(equipo)}
                    onChange={() =>
                      toggleFiltro(
                        equipo,
                        equiposSeleccionados,
                        setEquiposSeleccionados
                      )
                    }
                  />

                  <span>
                    {equipo} ({cantidad})
                  </span>
                </label>
              );
            })}
          </section>

          {/* PRECIO */}
          <section className="filter-section">
            <h3>Precio</h3>

            <label className="price-label">
              Precio mínimo: ${precioMin}
            </label>

            <input
              className="price-slider"
              type="range"
              min="0"
              max={precioTope}
              step="1"
              value={precioMin}
              onChange={(e) => {
                const valor = Number(e.target.value);

                setPrecioMin(
                  Math.min(valor, maxSeleccionado)
                );
              }}
            />

            <label className="price-label">
              Precio máximo: ${maxSeleccionado}
            </label>

            <input
              className="price-slider"
              type="range"
              min="0"
              max={precioTope}
              step="1"
              value={maxSeleccionado}
              onChange={(e) => {
                const valor = Number(e.target.value);

                setPrecioMax(
                  Math.max(valor, precioMin)
                );
              }}
            />
          </section>

          {/* BOTONES DE FILTROS */}
          <button
            type="button"
            className="filter-apply"
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            className="filter-clear"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>

        </aside>

        {/* LISTADO DE PRODUCTOS */}
        <section className="catalog-products">

          {loading ? (
            <p className="catalog-message">
              Cargando productos...
            </p>
          ) : error ? (
            <p className="catalog-message" role="alert">
              {error}
            </p>
          ) : (
            <>
              <p className="catalog-results">
                {productosOrdenados.length}
                {productosOrdenados.length === 1
                  ? ' producto encontrado'
                  : ' productos encontrados'}
              </p>

              <div className="product-list">
                {productosOrdenados.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onAddToCart={agregarAlCarrito}
                    onEliminar={handleProductoEliminado}
                  />
                ))}
              </div>

              {/* SIN RESULTADOS */}
              {productosOrdenados.length === 0 && (
                <p className="catalog-empty">
                  No encontramos productos con esos filtros.
                </p>
              )}
            </>
          )}

        </section>

      </div>
    </main>
  );
};

export default ProductList;
