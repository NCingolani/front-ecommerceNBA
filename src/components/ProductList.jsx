import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProductCard from './ProductCard';
import './ProductList.css';

const normalizar = (valor = '') =>
  String(valor ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');

const categorias = [
  'Camisetas',
  'Shorts',
  'Zapatillas',
  'Accesorios'
];

const equipos = [
  'Lakers',
  'Warriors',
  'Bulls',
  'Celtics',
  'Heat'
];

// Identifica el equipo desde el nombre
const obtenerEquipo = (producto) => {
  const nombre = normalizar(producto.nombre);

  return equipos.find((equipo) =>
    nombre.includes(normalizar(equipo))
  ) || '';
};

// Identifica la categoría del producto
const obtenerCategoria = (producto) => {
  const categoria = normalizar(producto.nombreCategoria);

  if (categoria) {
    const encontrada = categorias.find((cat) =>
      normalizar(cat) === categoria
    );

    return encontrada || producto.nombreCategoria;
  }

  // Respaldo por si el backend no envía categoría
  const nombre = normalizar(producto.nombre);

  if (nombre.includes('jersey') ||
    nombre.includes('camiseta')) return 'Camisetas';

  if (nombre.includes('short')) return 'Shorts';

  if (nombre.includes('zapatilla')) return 'Zapatillas';

  if (nombre.includes('gorra') ||
    nombre.includes('pelota')) return 'Accesorios';

  return '';
};

const ProductList = ({ onAddToCart }) => {
  const { session } = useAuth();
  const esAdmin = session?.role === 'ADMIN';

  const [searchParams] = useSearchParams();
  const categoriaURL =
    searchParams.get('categoria')?.trim() || '';

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Buscador y ordenamiento
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('default');

  // Filtros seleccionados
  const [categoriasSeleccionadas, setCategorias] = useState([]);
  const [equiposSeleccionados, setEquipos] = useState([]);

  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(null);

  // Filtros aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    categorias: [],
    equipos: [],
    minimo: 0,
    maximo: null
  });

  useEffect(() => {
    fetch('/api/productos')
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
          'No se pudo cargar el catálogo. Intenta nuevamente más tarde.'
        );
        setLoading(false);
      });
  }, []);

  const handleProductoEliminado = (idEliminado) => {
    setProductos((prev) => prev.filter((p) => p.id !== idEliminado));
  };

  // Precio máximo según los productos reales
  const precioTope = Math.max(
    100,
    Math.ceil(
      Math.max(...productos.map((p) => Number(p.precio) || 0), 0) / 50
    ) * 50
  );

  const maxSeleccionado = precioMax ?? precioTope;

  // Seleccionar y deseleccionar casillas
  const toggleFiltro = (valor, seleccionados, setter) => {
    setter(
      seleccionados.includes(valor)
        ? seleccionados.filter((v) => v !== valor)
        : [...seleccionados, valor]
    );
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados({
      categorias: [...categoriasSeleccionadas],
      equipos: [...equiposSeleccionados],
      minimo: precioMin,
      maximo: precioMax
    });
  };

  const limpiarFiltros = () => {
    setCategorias([]);
    setEquipos([]);
    setPrecioMin(0);
    setPrecioMax(null);

    setFiltrosAplicados({
      categorias: [],
      equipos: [],
      minimo: 0,
      maximo: null
    });
  };

  // Filtrado combinado
  const productosFiltrados = productos.filter((producto) => {
    const categoriaProducto = obtenerCategoria(producto);
    const equipoProducto = obtenerEquipo(producto);
    const precioProducto = Number(producto.precio) || 0;

    const coincideURL =
      !categoriaURL ||
      normalizar(categoriaProducto) === normalizar(categoriaURL);

    const coincideBusqueda = normalizar(producto.nombre)
      .includes(normalizar(busqueda));

    const coincideCategoria =
      filtrosAplicados.categorias.length === 0 ||
      filtrosAplicados.categorias.some(
        (cat) => normalizar(cat) === normalizar(categoriaProducto)
      );

    const coincideEquipo =
      filtrosAplicados.equipos.length === 0 ||
      filtrosAplicados.equipos.includes(equipoProducto);

    const coincidePrecio =
      precioProducto >= filtrosAplicados.minimo &&
      precioProducto <=
      (filtrosAplicados.maximo ?? precioTope);

    return (
      coincideURL &&
      coincideBusqueda &&
      coincideCategoria &&
      coincideEquipo &&
      coincidePrecio
    );
  });

  // Ordenamiento
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
      String(a.nombre).localeCompare(String(b.nombre), 'es')
    );
  }

  if (loading) {
    return <p className="catalog-message">Cargando catálogo...</p>;
  }

  if (error) {
    return <p className="catalog-message" role="alert">{error}</p>;
  }

  return (
    <main className="catalog-page">

      {/* ENCABEZADO */}
      <div className="catalog-heading">
        <div>
          <p>CATÁLOGO</p>
          <h1>{categoriaURL || 'Todos los productos'}</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {esAdmin && (
            <Link to="/crear" className="btn-onoff activo" style={{ textDecoration: 'none' }}>
              + Crear producto
            </Link>
          )}
          {categoriaURL && (
            <Link to="/productos">Ver todos los productos</Link>
          )}
        </div>
      </div>

      {/* BUSCADOR Y ORDEN */}
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <input
            type="search"
            placeholder="🔍 Buscar productos... Ej: Lakers"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

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

        {/* PANEL LATERAL */}
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
                <label key={cat} className="filter-option">
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
                  <span>{cat} ({cantidad})</span>
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
                <label key={equipo} className="filter-option">
                  <input
                    type="checkbox"
                    checked={equiposSeleccionados.includes(equipo)}
                    onChange={() =>
                      toggleFiltro(
                        equipo,
                        equiposSeleccionados,
                        setEquipos
                      )
                    }
                  />
                  <span>{equipo} ({cantidad})</span>
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
                setPrecioMin(Math.min(valor, maxSeleccionado));
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
                setPrecioMax(Math.max(valor, precioMin));
              }}
            />
          </section>

          {/* BOTONES */}
          <button
            className="filter-apply"
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </button>

          <button
            className="filter-clear"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </aside>

        {/* PRODUCTOS */}
        <section className="catalog-products">
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
                onAddToCart={onAddToCart}
                onEliminar={handleProductoEliminado}
              />
            ))}
          </div>

          {productosOrdenados.length === 0 && (
            <p className="catalog-empty">
              No encontramos productos con esos filtros.
            </p>
          )}
        </section>

      </div>
    </main>
  );
};

export default ProductList;
