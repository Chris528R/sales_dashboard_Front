import React from 'react';
import Pagination from './Pagination';

const SalesTable = ({ sales = [], currentPage = 1, itemsPerPage = 5, onView = () => {}, onCancel = () => {}, onPageChange = () => {} }) => {
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentSales = (sales || []).slice(idxFirst, idxLast);

  return (
    <div className="col-lg-6">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header bg-white fw-bold d-flex justify-content-between">
          <span>💰 Historial de Ventas</span>
          <small className="text-muted">Página {currentPage}</small>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Monto Total</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="text-muted small">{sale.fecha}</td>
                  <td className="fw-bold text-success">${sale.total.toFixed(2)}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-info" title="Ver Productos" onClick={() => onView(sale)}>📄</button>
                      <button className="btn btn-outline-danger" title="Cancelar Venta" onClick={() => onCancel(sale.id)}>❌</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentSales.length === 0 && (
                <tr><td colSpan="3" className="text-center text-muted">No hay ventas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 border-top">
          <Pagination totalItems={sales.length} currentPage={currentPage} itemsPerPage={itemsPerPage} onPageChange={onPageChange} />
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
