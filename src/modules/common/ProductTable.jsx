import React from 'react';
import Pagination from './Pagination';

class ProductTable extends React.Component {
  render() {
    const { products = [], currentPage = 1, itemsPerPage = 5, onDelete = () => {}, onView = () => {}, onEdit = () => {}, onPageChange = () => {} } = this.props;
    const idxLast = currentPage * itemsPerPage;
    const idxFirst = idxLast - itemsPerPage;
    const currentProducts = (products || []).slice(idxFirst, idxLast);

    return (
      <div className="col-lg-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header bg-white fw-bold d-flex justify-content-between">
            <span>📦 Inventario de Productos</span>
            <small className="text-muted">Página {currentPage}</small>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Stock</th>
                  <th>Nombre</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <span className={`badge ${prod.stock < 5 ? 'bg-danger' : 'bg-success'} bg-opacity-75`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{prod.nombre}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" title="Ver Detalles" onClick={() => onView('VIEW', 'PRODUCT', prod)}>👁️</button>
                        <button className="btn btn-outline-warning" title="Modificar" onClick={() => onEdit('EDIT', 'PRODUCT', prod)}>✏️</button>
                        <button
                          className="btn btn-outline-danger"
                          title="Eliminar"
                          onClick={() => onDelete(prod.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentProducts.length === 0 && (
                  <tr><td colSpan="3" className="text-center text-muted">No hay productos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-2 border-top">
            <Pagination totalItems={products.length} currentPage={currentPage} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
          </div>
        </div>
      </div>
    );
  }
}

export default ProductTable;
