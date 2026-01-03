import React, { useState } from 'react';

const SharedModal = ({ 
    show, onClose, mode, entity, data, saleDetails, productList,
    onChange, onSave, 
    onDetailChange, onDetailRemove, onDetailAdd 
}) => {
  
  const [selectedAddId, setSelectedAddId] = useState('');

  if (!show) return null;

  const title = mode === 'VIEW' ? 'Detalles de' : 'Editar';
  const entityName = entity === 'PRODUCT' ? 'Producto' : 'Venta';

  const dynamicTotal = saleDetails ? saleDetails.reduce((acc, item) => acc + (item.cantidad * item.precio), 0) : 0;

  const handleAddClick = () => {
      if(selectedAddId && onDetailAdd) {
          onDetailAdd(selectedAddId);
          setSelectedAddId('');
      }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title} {entityName} {mode === 'EDIT' && entity === 'SALE' && `(ID: ${data.id})`}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            
            {/* PRODUCTO */}
            {entity === 'PRODUCT' && (
              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input type="text" className="form-control" name="nombre" value={data.nombre || ''} onChange={onChange} disabled={mode === 'VIEW'} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-control" name="stock" value={data.stock || 0} onChange={onChange} disabled={mode === 'VIEW'} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Precio</label>
                    <input type="number" className="form-control" name="precio" value={data.precio || 0} onChange={onChange} disabled={mode === 'VIEW'} />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" name="descripcion" value={data.descripcion || ''} onChange={onChange} disabled={mode === 'VIEW'} />
                  </div>
                  {/* TODO: Agregar campo de categoría */}
                </div>
              </form>
            )}

            {/* VENTA */}
            {entity === 'SALE' && (
              <div>
                <div className="alert alert-light border d-flex justify-content-between align-items-center">
                  <span><strong>Fecha:</strong> {data.fecha}</span>
                  <h4 className="mb-0 text-success fw-bold">
                      Total: ${mode === 'EDIT' ? dynamicTotal.toFixed(2) : data.total}
                  </h4>
                </div>

                {/* EDITAR: AGREGAR PRODUCTO */}
                {mode === 'EDIT' && (
                    <div className="input-group mb-3">
                        <select 
                            className="form-select" 
                            value={selectedAddId}
                            onChange={(e) => setSelectedAddId(e.target.value)}
                        >
                            <option value="">Agregar producto a esta venta...</option>
                            {productList && productList.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} (${p.precio})</option>
                            ))}
                        </select>
                        <button className="btn btn-outline-success" type="button" onClick={handleAddClick}>
                            + Agregar
                        </button>
                    </div>
                )}

                {/* TABLA DE DETALLES */}
                <h6>Contenido de la venta:</h6>
                {saleDetails && saleDetails.length > 0 ? (
                  <table className="table table-striped align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Producto</th>
                        <th style={{width: '120px'}}>Cantidad</th>
                        <th>Precio U.</th>
                        <th>Subtotal</th>
                        {mode === 'EDIT' && <th>Acción</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {saleDetails.map((det, idx) => (
                        <tr key={idx}>
                          <td>{det.nombre}</td>
                          <td>
                              {mode === 'EDIT' ? (
                                  <input 
                                    type="number" 
                                    className="form-control form-control-sm"
                                    min="1"
                                    value={det.cantidad}
                                    onChange={(e) => onDetailChange(idx, e.target.value)}
                                  />
                              ) : (
                                  det.cantidad
                              )}
                          </td>
                          <td>${det.precio || det.precio_unitario}</td>
                          <td>${(det.cantidad * (det.precio || det.precio_unitario)).toFixed(2)}</td>
                          
                          {/* BOTÓN ELIMINAR FILA */}
                          {mode === 'EDIT' && (
                              <td>
                                  <button className="btn btn-sm btn-danger py-0" onClick={() => onDetailRemove(idx)}>×</button>
                              </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-muted">Esta venta no tiene productos (o se borraron todos).</p>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            {mode === 'EDIT' && (
              <button type="button" className="btn btn-primary" onClick={onSave}>Guardar Cambios</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedModal;