import React, { Component } from 'react';
import '@mescius/wijmo.styles/wijmo.css';

// Componentes de Wijmo
import { FlexChart, FlexChartSeries, FlexChartAxis, FlexPie } from '@mescius/wijmo.react.chart';
import Alert from '../common/Alert';
import MetricCard from '../common/MetricCard';
import ProductTable from '../common/ProductTable';
import SalesTable from '../common/SalesTable';
import ProductForm from '../common/ProductForm';
import SalePanel from '../common/SalePanel';

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

      // Paginación en las tablas 
      currentPageProd: 1,
      currentPageSale: 1,
      itemsPerPage: 5,

      // Lista de categorías 
      categoryList: [],
      newCategoryName: ''
    };
  }

  handleSelectionChange = (changes) => {
    this.setState(prev => ({ currentSelection: { ...prev.currentSelection, ...changes } }));
  };

  componentDidMount() {
    this.loadDashboardData();
    this.loadProducts();
    this.loadSalesHistory();
    this.loadMonthlyHistory();
    this.loadCategories();
  }

  loadCategories = () => {
    fetch('http://localhost:8080/api/categorias')
      .then(res => res.json())
      .then(data => {
        this.setState({ categoryList: data });
      })
      .catch(err => console.error("Error cargando categorías:", err));
  };

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

  handleAddCategory = (e) => {
    e.preventDefault();
    const { newCategoryName } = this.state;

    const formData = new URLSearchParams();
    formData.append('nombre', newCategoryName);

    fetch('http://localhost:8080/api/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', 'Categoría agregada correctamente');
          this.loadCategories(); // Recargar lista de categorías
          this.setState({ newCategoryName: '' });
        } else {
          this.showAlert('error', 'Error al agregar la categoría');
        }
      });
  };

  handleDeleteCategory = (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;

    fetch(`http://localhost:8080/api/categorias?id=${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          this.showAlert('success', 'Categoría eliminada');
          this.loadCategories(); // Recargar lista
        } else {
          this.showAlert('error', 'No se pudo eliminar la categoría');
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

  handleCategoryInputChange = (e) => {
    this.setState({ newCategoryName: e.target.value });
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
    formData.append('descripcion', descripcion); 
    formData.append('tipo', 'general'); 
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
    const {
      dashboardData, productList, salesList, // Datos
      newProduct, newSale, alert, cart, currentSelection, mockMonthlyData, // Formularios y UI
      currentPageProd, currentPageSale, itemsPerPage = 5 // Paginación 
    } = this.state;

    // pagination handled inside table components


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
            icon="💰"
            color="success"
          />

          <MetricCard
            title="Bajo Stock"
            value= {dashboardData.productosBajoStock}
            icon="⚠️"
            color="warning"
          />
          <MetricCard
            title="Total Productos"
            value={productList.length}
            icon="📦"
            color="primary"
          />
        </div>

        {/* CHARTS SECTION */}
        <div className="row g-3 mb-4">
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

          {/* Pie Chart: Ventas por Categoria */}
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

        {/* LISTS SECTION (Top Productos) */}
        <div className="row g-3 mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-3">Top 5 Productos Vendidos</h5>

                <div style={{ height: '400px' }}>
                  {dashboardData.topProductos.length > 0 ? (
                    <FlexChart
                      itemsSource={dashboardData.topProductos}
                      bindingX="producto"
                      rotated={true}
                      palette={['#0d6efd', '#6610f2', '#6f42c1']}
                    >
                      <FlexChartSeries
                        binding="cantidad"
                        name="Unidades"
                        // Personalizar el tooltip para que se vea claro
                        tooltipContent="<b>{seriesName}</b><br/>{item.producto}: {value}"
                      />

                      {/* Eje Y (Nombres de productos) */}
                      <FlexChartAxis
                        wjProperty="axisY"
                        reversed={true}
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                        majorGrid={false}
                      />

                      {/* Eje X (Cantidades) */}
                      <FlexChartAxis
                        wjProperty="axisX"
                        format="n0"
                        title="Cantidad Vendida"
                      />
                    </FlexChart>
                  ) : (
                    <p className="text-muted text-center mt-5">No hay datos de ventas aún.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN DE TABLAS DE GESTIÓN --- */}
        <div className="row g-4 mb-5">
          <ProductTable
            products={productList}
            currentPage={currentPageProd}
            itemsPerPage={itemsPerPage}
            onDelete={this.handleDeleteProduct}
            onPageChange={(page) => this.setState({ currentPageProd: page })}
          />

          <SalesTable
            sales={salesList}
            currentPage={currentPageSale}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => this.setState({ currentPageSale: page })}
          />
        </div>

        {/* --- FORMULARIOS DE OPERACIONES --- */}
        <h4 className="fw-bold mt-5 mb-3">Operaciones Rápidas</h4>
        <div className="row g-3">

          <ProductForm
            newProduct={newProduct}
            categoryList={this.state.categoryList}
            onChange={this.handleProductChange}
            onSubmit={this.submitProduct}
          />

          <SalePanel
            productList={productList}
            currentSelection={currentSelection}
            onSelectionChange={(changes) => this.handleSelectionChange(changes)}
            addToCart={this.addToCart}
            cart={cart}
            removeFromCart={this.removeFromCart}
            submitMultiProductSale={this.submitMultiProductSale}
          />

        </div>

        {/* SECCIÓN CATEGORÍAS */}
        <div className="col-md-12 mt-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Gestión de Categorías</div>
            <div className="card-body d-flex gap-3">
              <input
                type="text"
                className="form-control w-50"
                placeholder="Nueva categoría..."
                value={this.state.newCategoryName}
                onChange={this.handleCategoryInputChange}
              />
              <button className="btn btn-success" onClick={this.handleAddCategory}>Agregar</button>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {this.state.categoryList && this.state.categoryList.map(c => (
                  <li key={c.id} className="list-group-item d-flex justify-content-between">
                    {c.nombre}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => this.handleDeleteCategory(c.id)}>🗑️</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}




export default Administrator;