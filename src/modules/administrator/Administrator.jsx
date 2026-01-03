import React, { Component } from 'react';
import '@mescius/wijmo.styles/wijmo.css';

// Componentes de Wijmo
import { FlexChart, FlexChartSeries, FlexChartAxis, FlexPie } from '@mescius/wijmo.react.chart';
import Alert from '../common/Alert';

class Administrator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // --- DATOS DEL DASHBOARD (Vienen de /api/dashboard) ---
      dashboardData: {
        ventasHoy: 0,
        productosBajoStock: 0,
        ventasPorCategoria: [],
        topProductos: []
      },
      // --- DATOS AUXILIARES ---
      productList: [], // Para llenar el select de ventas
      salesList: [], // Historial de ventas para la tabla
      mockMonthlyData: [], // Datos para el gráfico de líneas

      // --- FORMULARIOS ---
      newProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'pieza' },
      newSale: { productId: '', quantity: 1 },

      // --- ALERTAS ---
      alert: { show: false, type: '', message: '' },

      // ESTADO PARA VENTA MULTI-PRODUCTO
      cart: [], // Aquí guardaremos los productos antes de vender
      currentSelection: { productId: '', quantity: 1 }, // Selección temporal

      // ESTADO PARA TABLAS
      showModal: false, // Para ver detalles/editar (opcional por ahora)
    };
  }

  componentDidMount() {
    this.loadDashboardData();
    this.loadProducts();
    this.loadSalesHistory();
    this.loadMonthlyHistory();
  }

  loadMonthlyHistory = () => {
    fetch('http://localhost:8080/api/ventas/historial')
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(item => ({
            month: item.mes,
            sales: item.total
        }));
        this.setState({ mockMonthlyData: formattedData });
      });
  }

  loadSalesHistory = () => {
    fetch('http://localhost:8080/api/ventas') 
      .then(res => res.json())
      .then(data => {
        this.setState({ salesList: data });
      })
      .catch(err => console.error("Error cargando historial ventas:", err));
  };

  // --- 1. CARGA DE DATOS (GET) ---
  loadDashboardData = () => {
    fetch('http://localhost:8080/api/dashboard')
      .then(res => res.json())
      .then(data => {
        this.setState({ dashboardData: data });
      })
      .catch(err => console.error("Error cargando dashboard:", err));
  };

  loadProducts = () => {
    fetch('http://localhost:8080/api/productos')
      .then(res => res.json())
      .then(data => {
        this.setState({ productList: data });
      })
      .catch(err => console.error("Error cargando productos:", err));
  };

  handleDeleteProduct = (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

    // Nota: Usamos fetch con DELETE y query param
    fetch(`http://localhost:8080/api/productos?id=${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', 'Producto eliminado');
          this.loadProducts(); // Recargar tabla
          this.loadDashboardData(); // Actualizar contadores
        } else {
          this.showAlert('error', 'No se pudo eliminar');
        }
      })
      .catch(err => this.showAlert('error', 'Error de conexión'));
  };

  // --- 2. MANEJO DE INPUTS ---
  handleProductChange = (e) => {
    const { name, value } = e.target;
    this.setState(prev => ({
      newProduct: { ...prev.newProduct, [name]: value }
    }));
  };

  handleSaleChange = (e) => {
    const { name, value } = e.target;
    this.setState(prev => ({
      newSale: { ...prev.newSale, [name]: value }
    }));
  };

  removeFromCart = (index) => {
    this.setState(prevState => {
      const newCart = [...prevState.cart];
      newCart.splice(index, 1);
      return { cart: newCart };
    });
  };

  submitMultiProductSale = () => {
    const { cart } = this.state;
    if (cart.length === 0) return;

    // Calculamos totales y preparamos los strings separados por comas
    const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const ids = cart.map(item => item.id).join(',');
    const cants = cart.map(item => item.cantidad).join(',');
    const precios = cart.map(item => item.precio).join(',');

    const formData = new URLSearchParams();
    formData.append('total', totalVenta);
    formData.append('ids_productos', ids);
    formData.append('cantidades', cants);
    formData.append('precios_unitarios', precios);

    fetch('http://localhost:8080/api/ventas', { // Ajusta tu URL
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', 'Venta registrada con éxito');
          this.setState({ cart: [] }); // Limpiar carrito
          this.loadDashboardData(); // Recargar gráficas
        } else {
          this.showAlert('error', 'No se pudo registrar la venta');
        }
      });
  };

  // --- 3. REGISTRAR PRODUCTO (POST) ---
  submitProduct = (e) => {
    e.preventDefault();
    const { nombre, descripcion, precio, stock, categoria, unidad } = this.state.newProduct;

    const formData = new URLSearchParams();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion); // Hardcodeado o agregar input si quieres
    formData.append('tipo', 'general'); // Valor por defecto
    formData.append('precio', precio);
    formData.append('stock', stock);
    formData.append('categoria', categoria);
    formData.append('unidad', unidad);

    fetch('http://localhost:8080/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', 'Producto registrado correctamente');
          this.loadDashboardData(); // Recargar gráficas
          this.loadProducts(); // Recargar lista para ventas
          // Limpiar form
          this.setState({ newProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'pieza' } });
        } else {
          this.showAlert('error', 'Error al registrar el producto');
        }
      })
      .catch(err => this.showAlert('error', 'Error de conexión'));
  };

  // --- 4. REGISTRAR VENTA (POST COMPLEJO) ---
  submitSale = (e) => {
    e.preventDefault();
    const { productId, quantity } = this.state.newSale;

    // Buscar el producto seleccionado para obtener su precio actual
    const selectedProd = this.state.productList.find(p => p.id == productId);

    if (!selectedProd) {
      this.showAlert('error', 'Selecciona un producto válido');
      return;
    }

    const precioUnitario = selectedProd.precio;
    const total = precioUnitario * quantity;

    // Preparar datos para tu API (Strings separados por comas)
    const formData = new URLSearchParams();
    formData.append('total', total);
    formData.append('ids_productos', productId.toString()); // "1"
    formData.append('cantidades', quantity.toString());     // "2"
    formData.append('precios_unitarios', precioUnitario.toString()); // "15.50"

    fetch('http://localhost:8080/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', `Venta registrada por $${total}`);
          this.loadDashboardData(); // Recargar métricas (Ventas hoy)
          this.setState({ newSale: { productId: '', quantity: 1 } });
        } else {
          this.showAlert('error', 'Error al registrar la venta');
        }
      })
      .catch(err => this.showAlert('error', 'Error de conexión'));
  };

  addToCart = () => {
    const { productId, quantity } = this.state.currentSelection;
    const product = this.state.productList.find(p => p.id == productId);

    if (!product || quantity < 1) return;

    const newItem = {
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: parseInt(quantity),
      subtotal: product.precio * quantity
    };

    this.setState(prevState => ({
      cart: [...prevState.cart, newItem],
      currentSelection: { productId: '', quantity: 1 } // Reset selección
    }));
  };

  // --- UTILIDADES ---
  showAlert = (type, message) => {
    this.setState({ alert: { show: true, type, message } });
  };

  closeAlert = () => {
    this.setState(prev => ({ alert: { ...prev.alert, show: false } }));
  };

  render() {
    const { dashboardData, productList, newProduct, newSale, alert, mockMonthlyData } = this.state;

    return (
      <div className="container-fluid bg-light min-vh-100 p-4">

        {/* ALERTA MODAL */}
        <Alert
          show={alert.show}
          type={alert.type}
          message={alert.message}
          onClose={this.closeAlert}
        />

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">Panel de Control</h2>
            <p className="text-muted">Resumen de ventas e inventario</p>
          </div>
        </div>

        {/* METRICS CARDS (Con Datos Reales) */}
        <div className="row g-3 mb-4">
          <MetricCard
            title="Ventas de Hoy"
            value={`$${dashboardData.ventasHoy}`}
            change="Día actual"
            icon="💰"
            color="success"
          />
          <MetricCard
            title="Prod. Bajo Stock"
            value={dashboardData.productosBajoStock}
            change="Atención requerida"
            icon="⚠️"
            color="warning"
          />
          <MetricCard
            title="Total Productos"
            value={productList.length}
            change="En catálogo"
            icon="📦"
            color="primary"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="row g-3 mb-4">
          {/* Line Chart: Usamos Mock porque el endpoint no devuelve historial mensual aun */}
          <div className="col-lg-8">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title">Tendencia de Ventas</h5>
                <p className="text-muted small">Simulación mensual</p>
                <div style={{ height: '400px' }}>
                  <FlexChart itemsSource={mockMonthlyData} bindingX="month" chartType="Spline">
                    <FlexChartSeries binding="sales" name="Ventas" />
                    <FlexChartAxis wjProperty="axisY" format="c0" />
                  </FlexChart>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart: Ventas por Categoria (REAL) */}
          <div className="col-lg-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body">
                <h5 className="card-title">Ventas por Categoría</h5>
                <div style={{ height: '300px' }}>
                  <FlexPie
                    itemsSource={dashboardData.ventasPorCategoria}
                    binding="monto"
                    bindingName="categoria"
                    innerRadius={0.5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LISTS SECTION (Top Productos REAL) */}
        <div className="row g-3 mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">Top Productos Vendidos</h5>
                <div className="list-group list-group-flush">
                  {dashboardData.topProductos.map((prod, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                      <div>
                        <h6 className="mb-0">{prod.producto}</h6>
                      </div>
                      <div className="text-end">
                        <small className="text-success fw-bold">{prod.cantidad} vendidos</small>
                      </div>
                    </div>
                  ))}
                  {dashboardData.topProductos.length === 0 && <p className="text-muted small">No hay datos aún.</p>}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- SECCIÓN DE TABLAS DE GESTIÓN --- */}
        <div className="row g-4 mb-5">

          {/* TABLA 1: PRODUCTOS (Stock, Nombre, Acción) */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold d-flex justify-content-between">
                <span>📦 Últimos Productos</span>
                <small className="text-muted">Mostrando primeros 10</small>
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
                    {this.state.productList.slice(0, 10).map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <span className={`badge ${prod.stock < 5 ? 'bg-danger' : 'bg-success'} bg-opacity-75`}>
                            {prod.stock}
                          </span>
                        </td>
                        <td className="fw-bold text-dark">{prod.nombre}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            {/* Botón Ver */}
                            <button className="btn btn-outline-primary" title="Ver Detalles">
                              👁️
                            </button>
                            {/* Botón Editar */}
                            <button className="btn btn-outline-warning" title="Modificar">
                              ✏️
                            </button>
                            {/* Botón Eliminar */}
                            <button
                              className="btn btn-outline-danger"
                              title="Eliminar"
                              onClick={() => this.handleDeleteProduct(prod.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABLA 2: VENTAS (Fecha, Monto, Acción) */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold d-flex justify-content-between">
                <span>💰 Historial de Ventas</span>
                <small className="text-muted">Mostrando primeras 10</small>
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
                    {/* Asumimos que tienes salesList en tu state cargado desde /api/ventas */}
                    {(this.state.salesList || []).slice(0, 10).map((sale) => (
                      <tr key={sale.id}>
                        <td className="text-muted small">{sale.fecha}</td>
                        <td className="fw-bold text-success">${sale.total.toFixed(2)}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-info" title="Ver Productos">
                              📄
                            </button>
                            <button className="btn btn-outline-danger" title="Cancelar Venta">
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- FORMULARIOS DE OPERACIONES --- */}
        <h4 className="fw-bold mt-5 mb-3">Operaciones Rápidas</h4>
        <div className="row g-3">

          {/* Formulario Registrar Producto */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold">📦 Nuevo Producto</div>
              <div className="card-body">
                <form onSubmit={this.submitProduct}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text" name="nombre" className="form-control" required
                      value={newProduct.nombre} onChange={this.handleProductChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text" name="descripcion" className="form-control"
                      value={newProduct.descripcion} onChange={this.handleProductChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Precio ($)</label>
                      <input
                        type="number" name="precio" className="form-control" step="0.01" required
                        value={newProduct.precio} onChange={this.handleProductChange}
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Stock</label>
                      <input
                        type="number" name="stock" className="form-control" required
                        value={newProduct.stock} onChange={this.handleProductChange}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Guardar Producto</button>
                </form>
              </div>
            </div>
          </div>

          {/* Formulario Registrar Venta (Multi-Producto) */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold">💳 Registrar Nueva Venta</div>
              <div className="card-body">

                {/* 1. Selección de producto */}
                <div className="d-flex gap-2 mb-3">
                  <select
                    className="form-select"
                    value={this.state.currentSelection.productId}
                    onChange={(e) => this.setState({ currentSelection: { ...this.state.currentSelection, productId: e.target.value } })}
                  >
                    <option value="">Seleccionar producto...</option>
                    {this.state.productList.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '80px' }}
                    min="1"
                    value={this.state.currentSelection.quantity}
                    onChange={(e) => this.setState({ currentSelection: { ...this.state.currentSelection, quantity: e.target.value } })}
                  />
                  <button type="button" className="btn btn-primary" onClick={this.addToCart}>+</button>
                </div>

                {/* 2. Lista de "Carrito" (Tabla pequeña) */}
                <div className="bg-light p-2 rounded mb-3" style={{ minHeight: '100px', maxHeight: '150px', overflowY: 'auto' }}>
                  {this.state.cart.length === 0 ? (
                    <p className="text-center text-muted small mt-4">No hay productos agregados</p>
                  ) : (
                    <table className="table table-sm table-borderless small mb-0">
                      <tbody>
                        {this.state.cart.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.cantidad}x {item.nombre}</td>
                            <td className="text-end">${item.subtotal.toFixed(2)}</td>
                            <td className="text-end">
                              <button className="btn btn-link text-danger p-0 text-decoration-none" onClick={() => this.removeFromCart(idx)}>×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* 3. Total y Botón Final */}
                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                  <h5 className="mb-0 fw-bold">Total: ${this.state.cart.reduce((a, b) => a + b.subtotal, 0).toFixed(2)}</h5>
                  <button
                    type="button"
                    className="btn btn-success fw-bold"
                    onClick={this.submitMultiProductSale}
                    disabled={this.state.cart.length === 0}
                  >
                    Cobrar
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}


// Componente visual pequeño (stateless)
const MetricCard = ({ title, value, change, icon, color }) => (
  <div className="col-md-4">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <div className={`text-${color} bg-${color} bg-opacity-10 p-2 rounded`}>{icon}</div>
          <span className={`badge bg-${color} bg-opacity-10 text-${color}`}>
            {change}
          </span>
        </div>
        <h6 className="text-muted fw-normal">{title}</h6>
        <h3 className="fw-bold mb-0">{value}</h3>
      </div>
    </div>
  </div>
);

export default Administrator;