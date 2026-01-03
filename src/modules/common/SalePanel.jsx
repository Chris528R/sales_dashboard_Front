import React from 'react';

class SalePanel extends React.Component {
  render() {
    const { productList = [], currentSelection = {}, onSelectionChange = () => {}, addToCart = () => {}, cart = [], removeFromCart = () => {}, submitMultiProductSale = () => {} } = this.props;
    const total = (cart || []).reduce((a, b) => a + b.subtotal, 0).toFixed(2);

    return (
      <div className="col-md-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-header bg-white fw-bold">💳 Registrar Nueva Venta</div>
          <div className="card-body">

            <div className="d-flex gap-2 mb-3">
              <select
                className="form-select"
                value={currentSelection.productId || ''}
                onChange={(e) => onSelectionChange({ productId: e.target.value })}
              >
                <option value="">Seleccionar producto...</option>
                {productList.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                style={{ width: '80px' }}
                min="1"
                value={currentSelection.quantity}
                onChange={(e) => onSelectionChange({ quantity: e.target.value })}
              />
              <button type="button" className="btn btn-primary" onClick={addToCart}>+</button>
            </div>

            <div className="bg-light p-2 rounded mb-3" style={{ minHeight: '100px', maxHeight: '150px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p className="text-center text-muted small mt-4">No hay productos agregados</p>
              ) : (
                <table className="table table-sm table-borderless small mb-0">
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.cantidad}x {item.nombre}</td>
                        <td className="text-end">${item.subtotal.toFixed(2)}</td>
                        <td className="text-end">
                          <button className="btn btn-link text-danger p-0 text-decoration-none" onClick={() => removeFromCart(idx)}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <h5 className="mb-0 fw-bold">Total: ${total}</h5>
              <button
                type="button"
                className="btn btn-success fw-bold"
                onClick={submitMultiProductSale}
                disabled={cart.length === 0}
              >
                Cobrar
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default SalePanel;
