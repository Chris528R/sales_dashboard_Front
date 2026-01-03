import React from 'react';

const ProductForm = ({ newProduct = {}, categoryList = [], onChange = () => {}, onSubmit = () => {} }) => (
  <div className="col-md-6">
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white fw-bold">📦 Nuevo Producto</div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text" name="nombre" className="form-control" required
              value={newProduct.nombre || ''} onChange={onChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <input
              type="text" name="descripcion" className="form-control"
              value={newProduct.descripcion || ''} onChange={onChange}
            />
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label">Categoría</label>
              <select
                name="categoria"
                className="form-select"
                value={newProduct.categoria}
                onChange={onChange}
              >
                {categoryList && categoryList.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Unidad Medida</label>
              <select name="unidad" className="form-select" value={newProduct.unidad} onChange={onChange}>
                <option value="Pieza">Pieza</option>
                <option value="Kg">Kg</option>
                <option value="Litro">Litro</option>
                <option value="Paquete">Paquete</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label">Precio ($)</label>
              <input
                type="number" name="precio" className="form-control" step="0.01" required
                value={newProduct.precio || ''} onChange={onChange}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label">Stock</label>
              <input
                type="number" name="stock" className="form-control" required
                value={newProduct.stock || ''} onChange={onChange}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">Guardar Producto</button>
        </form>
      </div>
    </div>
  </div>
);

export default ProductForm;
