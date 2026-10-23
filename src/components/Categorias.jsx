import { Link } from "react-router-dom";

export default function Categorias({ categorias }) {
  return (
    <section id="categorias" className="nba-section">
      <div className="nba-heading">
        <h2>CATEGORÍAS</h2>
        <Link to="/productos">Ver todas las categorías →</Link>
      </div>

      <div className="nba-categorias">
        {categorias.map((categoria) => (
          <Link
            to="/productos"
            className="nba-categoria"
            key={categoria.id || categoria.nombre}
          >
            <img src={categoria.imagen} alt={categoria.nombre} />
            <div>
              <h3>{categoria.nombre}</h3>
              <small>Ver productos →</small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}