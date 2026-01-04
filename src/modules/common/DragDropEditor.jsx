import React from 'react';

class DragDropEditor extends React.Component {
  render() {
    const { newItem, items, onNewChange, onAdd, onDelete } = this.props;

    return (
      <div>
        <h5 className="text-secondary">Configurar Elementos Arrastrables</h5>
        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-5">
            <label className="small">Nombre</label>
            <input className="form-control form-control-sm" value={newItem.nombre} onChange={e => onNewChange({ ...newItem, nombre: e.target.value })} />
          </div>
          <div className="col-md-5">
            <label className="small">Categoría</label>
            <input className="form-control form-control-sm" value={newItem.categoria} onChange={e => onNewChange({ ...newItem, categoria: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={onAdd}>+ Agregar</button>
          </div>
        </div>
        <ul>
          {items.map((it, i) => (
            <li key={i} className="d-flex justify-content-between w-50">
              <span>{it.nombre} ➝ {it.categoria}</span>
              <button className="btn btn-sm text-danger" onClick={() => onDelete(i)}>x</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default DragDropEditor;
