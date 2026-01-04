import React from 'react';

class GraphEditor extends React.Component {
  render() {
    const {
      tipoGrafica,
      datosGrafica,
      nuevoDatoGrafica,
      opcionesRespuesta,
      nuevaOpcion,
      onTipoGraficaChange,
      onNuevoDatoChange,
      onAddGraphData,
      onRemoveData,
      onNewOptionChange,
      onAddOption,
      onRemoveOption,
    } = this.props;

    return (
      <div>
        <h5 className="text-secondary">Configurar Gráfica y Opciones</h5>

        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-3">
            <label className="small">Tipo</label>
            <select className="form-select form-select-sm" value={tipoGrafica} onChange={onTipoGraficaChange}>
              <option value="barras">Barras</option>
              <option value="pastel">Pastel</option>
              <option value="linea">Línea</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="small">Etiqueta</label>
            <input className="form-control form-control-sm" value={nuevoDatoGrafica.nombre} onChange={onNuevoDatoChange} name="nombre" />
          </div>
          <div className="col-md-3">
            <label className="small">Valor</label>
            <input type="number" className="form-control form-control-sm" value={nuevoDatoGrafica.valor} onChange={onNuevoDatoChange} name="valor" />
          </div>
          <div className="col-md-2">
            <button type="button" className="btn btn-sm btn-outline-success w-100" onClick={onAddGraphData}>+ Dato</button>
          </div>
        </div>

        {datosGrafica && datosGrafica.length > 0 && (
          <small className="d-block mb-3 text-success">{datosGrafica.length} datos agregados a la gráfica.</small>
        )}

        <ul className="mb-3 text-muted small">
          {datosGrafica && datosGrafica.map((d, i) => (
            <li key={i}>{d.nombre}: {d.valor} <button className="btn btn-link text-danger p-0" onClick={() => onRemoveData(i)}>[x]</button></li>
          ))}
        </ul>

        <div className="row g-2 align-items-end mb-3">
          <div className="col-md-6">
            <label className="small">Opción Texto</label>
            <input className="form-control form-control-sm" value={nuevaOpcion.texto} onChange={e => onNewOptionChange({ ...nuevaOpcion, texto: e.target.value })} />
          </div>
          <div className="col-md-3">
            <div className="form-check pt-4">
              <input className="form-check-input" type="checkbox" checked={nuevaOpcion.esCorrecta} onChange={e => onNewOptionChange({ ...nuevaOpcion, esCorrecta: e.target.checked })} />
              <label className="form-check-label small">Correcta</label>
            </div>
          </div>
          <div className="col-md-3">
            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={onAddOption}>+ Opción</button>
          </div>
        </div>

        <ul className="list-group w-50">
          {opcionesRespuesta && opcionesRespuesta.map((op, i) => (
            <li key={i} className={`list-group-item ${op.esCorrecta ? 'list-group-item-success' : ''}`}>
              <span>{op.texto}</span>
              <button className="btn btn-sm text-danger float-end" onClick={() => onRemoveOption(i)}>x</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default GraphEditor;
