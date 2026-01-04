import React, { Component } from 'react';
import GraphEditor from '../common/GraphEditor';
import DragDropEditor from '../common/DragDropEditor';
import SimulationConfigurator from '../common/SimulationConfigurator';
import { Navigate, useParams, Link } from 'react-router-dom';
import ProductForm from '../common/ProductForm';
import ProductTable from '../common/ProductTable';
import SalePanel from '../common/SalePanel';
import SalesTable from '../common/SalesTable';
import SharedModal from '../common/SharedModal';

export function withRouter(Children){
  return(props)=>{
     const match = {params: useParams()};
     return <Children {...props} match={match}/>
   }
}

class EditarEjercicio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      // --- ESTADO GENERAL ---
      titulo: '',
      nivel: 'Intermedio',
      tipoEjercicio: 'simulacion_dashboard',
      pregunta: '',
      redirect: false,

      // --- ESTADO: DRAG & DROP ---
      itemsDrag: [],
      newItemDrag: { nombre: '', imagen: '', categoria: '' },

      // --- ESTADO: ANÁLISIS GRÁFICO ---
      tipoGrafica: 'barras',
      datosGrafica: [],
      nuevoDatoGrafica: { nombre: '', valor: '' },
      opcionesRespuesta: [],
      nuevaOpcion: { texto: '', esCorrecta: false },

      // --- ESTADO: SIMULACIÓN DASHBOARD ---
      mockProducts: [],
      mockSales: [],
      tempNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' },
      tempNewSale: { productId: '', quantity: 1 },
      tempCart: [],
      
      // --- ESTADO: MODAL DE EDICIÓN ---
      showModal: false,
      modalMode: 'VIEW',
      modalEntity: 'PRODUCT',
      selectedItem: {},
      saleDetails: [],

      categoryList: [
        { id: 1, nombre: 'Bebidas' }, { id: 2, nombre: 'Tecnología' }, { id: 3, nombre: 'Limpieza' }, 
        { id: 4, nombre: 'Botanas' }, { id: 5, nombre: 'Abarrotes' }
      ],
    };
  }

  componentDidMount() {
      const id = this.props.match.params.id;
      this.loadExerciseData(id);
  }

  loadExerciseData = (id) => {
      fetch(`http://localhost:8080/api/ejercicios?id=${id}`)
        .then(res => res.json())
        .then(data => {
            // Parsear contenido JSON
            const content = typeof data.contenido === 'string' ? JSON.parse(data.contenido) : data.contenido;
            
            // Estado base
            let newState = {
                loading: false,
                titulo: data.titulo,
                nivel: data.nivel,
                tipoEjercicio: content.tipo,
                pregunta: content.pregunta
            };

            // RECONSTRUIR EL ESTADO SEGÚN EL TIPO
            if (content.tipo === 'drag_drop') {
                // Reconstruir lista plana desde Drags y Targets
                const reconstructedItems = [];
                content.targets.forEach(t => {
                    t.aceptados.forEach(dragId => {
                        const dragObj = content.drags.find(d => d.id === dragId);
                        if(dragObj) {
                            reconstructedItems.push({ 
                                id: dragId, 
                                nombre: dragObj.valor, 
                                categoria: t.valor 
                            });
                        }
                    });
                });
                newState.itemsDrag = reconstructedItems;
            } 
            else if (content.tipo === 'analisis_grafico') {
                newState.tipoGrafica = content.tipoGrafica;
                newState.datosGrafica = content.datosGrafica;
                newState.opcionesRespuesta = content.opciones;
            } 
            else if (content.tipo === 'simulacion_dashboard') {
                newState.mockProducts = content.datos_iniciales.productos || [];
                newState.mockSales = content.datos_iniciales.ventas || [];
            }

            this.setState(newState);
        })
        .catch(err => console.error("Error cargando ejercicio", err));
  };

  // ==============================================================
  // LOGICA 1: DRAG & DROP
  // ==============================================================
  addDragItem = () => {
    const { newItemDrag, itemsDrag } = this.state;
    if (!newItemDrag.nombre || !newItemDrag.categoria) return;
    this.setState({
      itemsDrag: [...itemsDrag, { ...newItemDrag, id: Date.now() }],
      newItemDrag: { nombre: '', imagen: '', categoria: '' }
    });
  };

  // ==============================================================
  // LOGICA 2: ANÁLISIS GRÁFICO
  // ==============================================================
  addGraphData = () => {
    const { nuevoDatoGrafica, datosGrafica } = this.state;
    if (!nuevoDatoGrafica.nombre || !nuevoDatoGrafica.valor) return;
    this.setState({
      datosGrafica: [...datosGrafica, { ...nuevoDatoGrafica }],
      nuevoDatoGrafica: { nombre: '', valor: '' }
    });
  };

  addOption = () => {
    const { nuevaOpcion, opcionesRespuesta } = this.state;
    if (!nuevaOpcion.texto) return;
    this.setState({
      opcionesRespuesta: [...opcionesRespuesta, { ...nuevaOpcion }],
      nuevaOpcion: { texto: '', esCorrecta: false }
    });
  };

  // ==============================================================
  // LOGICA 3: SIMULACIÓN DASHBOARD (MOCK DB)
  // ==============================================================
  handleMockProductChange = (e) => {
    const { name, value } = e.target;
    this.setState(prev => ({ tempNewProduct: { ...prev.tempNewProduct, [name]: value } }));
  };

  submitMockProduct = (e) => {
    e.preventDefault();
    const { tempNewProduct, mockProducts } = this.state;
    const newProd = {
      ...tempNewProduct, id: Date.now(), stock: parseInt(tempNewProduct.stock), precio: parseFloat(tempNewProduct.precio)
    };
    this.setState({
      mockProducts: [...mockProducts, newProd],
      tempNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' }
    });
  };

  deleteMockProduct = (id) => {
    this.setState(prev => ({ mockProducts: prev.mockProducts.filter(p => p.id !== id) }));
  };

  handleMockSelectionChange = (changes) => {
    this.setState(prev => ({ tempNewSale: { ...prev.tempNewSale, ...changes } }));
  };

  addToMockCart = () => {
    const { tempNewSale, mockProducts } = this.state;
    const product = mockProducts.find(p => p.id == tempNewSale.productId);
    if (!product) return;
    const item = {
      id: product.id, nombre: product.nombre, precio: product.precio,
      cantidad: parseInt(tempNewSale.quantity), subtotal: parseInt(tempNewSale.quantity) * product.precio
    };
    this.setState(prev => ({ tempCart: [...prev.tempCart, item], tempNewSale: { productId: '', quantity: 1 } }));
  };

  removeFromMockCart = (idx) => {
    this.setState(prev => {
      const newCart = [...prev.tempCart];
      newCart.splice(idx, 1);
      return { tempCart: newCart };
    });
  };

  submitMockSale = () => {
    const { tempCart, mockProducts } = this.state;
    if (tempCart.length === 0) return;
    const total = tempCart.reduce((acc, item) => acc + item.subtotal, 0);
    const newSale = { id: Date.now(), fecha: new Date().toLocaleString(), total: total, detalles: tempCart };
    
    // Descontar stock local
    const updatedProducts = mockProducts.map(prod => {
        const itemInCart = tempCart.find(item => item.id === prod.id);
        return itemInCart ? { ...prod, stock: Math.max(0, prod.stock - itemInCart.cantidad) } : prod;
    });

    this.setState(prev => ({ 
        mockSales: [...prev.mockSales, newSale], 
        mockProducts: updatedProducts,
        tempCart: [] 
    }));
  };

  // ==============================================================
  // LOGICA 4: CONTROL DEL MODAL (Igual que CreateExercise)
  // ==============================================================
  openMockModal = (mode, entity, item) => {
    let details = [];
    if (entity === 'SALE') details = item.detalles ? [...item.detalles] : [];
    this.setState({
      showModal: true, modalMode: mode, modalEntity: entity, selectedItem: { ...item }, saleDetails: details
    });
  };

  closeModal = () => {
    this.setState({ showModal: false, selectedItem: {}, saleDetails: [] });
  };

  handleModalChange = (e) => {
    const { name, value } = e.target;
    this.setState(prev => ({ selectedItem: { ...prev.selectedItem, [name]: value } }));
  };

  saveMockChanges = () => {
    const { modalEntity, selectedItem, saleDetails, mockProducts, mockSales } = this.state;
    if (modalEntity === 'PRODUCT') {
        const updatedProducts = mockProducts.map(p => p.id === selectedItem.id ? selectedItem : p);
        this.setState({ mockProducts: updatedProducts, showModal: false });
    } else if (modalEntity === 'SALE') {
        const originalSale = mockSales.find(s => s.id === selectedItem.id);
        if (!originalSale) return;
        const updatedProducts = mockProducts.map(prod => {
            let currentStock = prod.stock;
            const originalItem = originalSale.detalles.find(d => d.id === prod.id);
            if (originalItem) currentStock += parseInt(originalItem.cantidad);
            const newItem = saleDetails.find(d => d.id === prod.id);
            if (newItem) currentStock -= parseInt(newItem.cantidad);
            return { ...prod, stock: Math.max(0, currentStock) };
        });
        const newTotal = saleDetails.reduce((acc, item) => acc + item.subtotal, 0);
        const updatedSale = { ...selectedItem, total: newTotal, detalles: saleDetails };
        const updatedSales = mockSales.map(s => s.id === selectedItem.id ? updatedSale : s);
        this.setState({ mockSales: updatedSales, mockProducts: updatedProducts, showModal: false });
    }
  };

    handleMockDetailChange = (idx, val) => {
      const qty = parseInt(val);
      if(qty < 1 || isNaN(qty)) return;
      this.setState(prev => {
          const det = [...prev.saleDetails]; det[idx].cantidad = qty; det[idx].subtotal = qty * det[idx].precio;
          return { saleDetails: det };
      })
  };
  handleMockDetailRemove = (idx) => {
      this.setState(prev => {
          const det = [...prev.saleDetails]; det.splice(idx,1); return { saleDetails: det };
      });
  };
  handleMockDetailAdd = (id) => {
      const { mockProducts, saleDetails } = this.state;
      const p = mockProducts.find(x => x.id == id);
      if(!p) return;
      const det = [...saleDetails];
      const exist = det.findIndex(x => x.id === id);
      if(exist >= 0) { det[exist].cantidad++; det[exist].subtotal = det[exist].cantidad * p.precio; }
      else { det.push({id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, subtotal: p.precio}); }
      this.setState({ saleDetails: det });
  };

  // ==============================================================
  // GUARDAR EDICIÓN (UPDATE)
  // ==============================================================
  handleSubmit = (e) => {
    e.preventDefault();
    const { titulo, nivel, tipoEjercicio, pregunta } = this.state;
    const id = this.props.match.params.id; // ID para actualizar
    let jsonContent = {};

    if (tipoEjercicio === 'drag_drop') {
      const { itemsDrag } = this.state;
      const drags = itemsDrag.map(i => ({ id: i.id, valor: i.nombre, imagen: "https://via.placeholder.com/150" }));
      const uniqueCats = [...new Set(itemsDrag.map(i => i.categoria))];
      const targets = uniqueCats.map(cat => ({
        valor: cat, aceptados: itemsDrag.filter(i => i.categoria === cat).map(i => i.id)
      }));
      jsonContent = { tipo: "drag_drop", pregunta, drags, targets };
    } else if (tipoEjercicio === 'analisis_grafico') {
      const { tipoGrafica, datosGrafica, opcionesRespuesta } = this.state;
      jsonContent = { tipo: "analisis_grafico", pregunta, tipoGrafica, datosGrafica, opciones: opcionesRespuesta };
    } else if (tipoEjercicio === 'simulacion_dashboard') {
      const { mockProducts, mockSales } = this.state;
      jsonContent = { tipo: "simulacion_dashboard", pregunta, datos_iniciales: { productos: mockProducts, ventas: mockSales } };
    }

    const formData = new URLSearchParams();
    formData.append('titulo', titulo);
    formData.append('nivel', nivel);
    formData.append('contenido', JSON.stringify(jsonContent));

    fetch(`http://localhost:8080/api/ejercicios?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') this.setState({ redirect: true });
      else alert('Error al actualizar');
    });
  };

  render() {
    if (this.state.redirect) return <Navigate to="/administrator" />;
    if (this.state.loading) return <div className="p-5 text-center">Cargando datos...</div>;

    const { 
      tipoEjercicio, titulo, nivel, pregunta, 
      itemsDrag, newItemDrag,
      tipoGrafica, datosGrafica, nuevoDatoGrafica, opcionesRespuesta, nuevaOpcion,
      mockProducts, mockSales, tempNewProduct, tempNewSale, tempCart, categoryList
    } = this.state;

    return (
      <div className="container mt-5 mb-5">
        <div className="card shadow-lg border-0">
          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h4 className="mb-0">✏️ Editar Ejercicio #{this.props.match.params.id}</h4>
            <Link to="/administrator" className="btn btn-sm btn-outline-dark">Cancelar</Link>
          </div>
          
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Título del Ejercicio</label>
                <input className="form-control" value={titulo} onChange={e => this.setState({ titulo: e.target.value })} />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Nivel</label>
                <select className="form-select" value={nivel} onChange={e => this.setState({ nivel: e.target.value })}>
                  <option>Principiante</option><option>Intermedio</option><option>Avanzado</option>
                </select>
              </div>
              <div className="col-md-5">
                <label className="form-label fw-bold text-primary">Tipo de Ejercicio</label>
                <select className="form-select border-primary fw-bold" disabled value={tipoEjercicio} onChange={e => this.setState({ tipoEjercicio: e.target.value })}>
                  <option value="simulacion_dashboard">⭐ Simulación Completa (Dashboard)</option>
                  <option value="drag_drop">🧩 Clasificación (Drag & Drop)</option>
                  <option value="analisis_grafico">📊 Análisis de Gráficas</option>
                </select>
              </div>
              <div className="col-12 mt-3">
                <label className="form-label">Pregunta / Instrucción</label>
                <input className="form-control" value={pregunta} onChange={e => this.setState({ pregunta: e.target.value })} />
              </div>
            </div>

            <hr className="my-4" />

            {/* ZONA DE EDICIÓN DE CONTENIDO (COPIADA DE CREATE) */}
            {tipoEjercicio === 'simulacion_dashboard' && (
              <div>
                <h5 className="text-primary fw-bold mb-3">🛠️ Editar Estado Inicial</h5>
                <SimulationConfigurator
                  newProduct={tempNewProduct}
                  categoryList={categoryList}
                  onProductChange={this.handleMockProductChange}
                  onProductSubmit={this.submitMockProduct}

                  products={mockProducts}
                  currentPageProd={1}
                  itemsPerPageProd={5}
                  onPageChangeProd={(page) => {}}
                  onDeleteProduct={this.deleteMockProduct}
                  onViewProduct={(m,e,i)=>this.openMockModal(m,e,i)}
                  onEditProduct={(m,e,i)=>this.openMockModal(m,e,i)}

                  productList={mockProducts}
                  currentSelection={tempNewSale}
                  onSelectionChange={this.handleMockSelectionChange}
                  addToCart={this.addToMockCart}
                  cart={tempCart}
                  removeFromCart={this.removeFromMockCart}
                  submitMultiProductSale={this.submitMockSale}

                  sales={mockSales}
                  currentPageSale={1}
                  itemsPerPageSale={5}
                  onPageChangeSale={(page) => {}}
                  onCancelSale={(id) => this.setState(p => ({ mockSales: p.mockSales.filter(s => s.id !== id) }))}
                  onViewSale={(m,e,i)=>this.openMockModal(m,e,i)}
                  onEditSale={(m,e,i)=>this.openMockModal(m,e,i)}
                />
              </div>
            )}

            {tipoEjercicio === 'drag_drop' && (
              <div>
                <DragDropEditor
                  newItem={newItemDrag}
                  items={itemsDrag}
                  onNewChange={obj => this.setState({ newItemDrag: obj })}
                  onAdd={this.addDragItem}
                  onDelete={i => this.setState(p => ({ itemsDrag: p.itemsDrag.filter((_, idx) => idx !== i) }))}
                />
              </div>
            )}

            {tipoEjercicio === 'analisis_grafico' && (
              <div>
                <GraphEditor
                  tipoGrafica={tipoGrafica}
                  datosGrafica={datosGrafica}
                  nuevoDatoGrafica={nuevoDatoGrafica}
                  opcionesRespuesta={opcionesRespuesta}
                  nuevaOpcion={nuevaOpcion}
                  onTipoGraficaChange={e => this.setState({ tipoGrafica: e.target.value })}
                  onNuevoDatoChange={e => this.setState({ nuevoDatoGrafica: { ...nuevoDatoGrafica, [e.target.name]: e.target.value } })}
                  onAddGraphData={this.addGraphData}
                  onRemoveData={i => this.setState(p => ({ datosGrafica: p.datosGrafica.filter((_, idx) => idx !== i) }))}
                  onNewOptionChange={obj => this.setState({ nuevaOpcion: obj })}
                  onAddOption={this.addOption}
                  onRemoveOption={i => this.setState(p => ({ opcionesRespuesta: p.opcionesRespuesta.filter((_, idx) => idx !== i) }))}
                />
              </div>
            )}

            <div className="d-grid gap-2 mt-5 border-top pt-4">
                <button className="btn btn-warning btn-lg fw-bold" onClick={this.handleSubmit}>
                    💾 Actualizar Cambios
                </button>
            </div>

          </div>
        </div>

        {/* MODAL REUTILIZADO */}
        <SharedModal 
           show={this.state.showModal}
           onClose={this.closeModal}
           mode={this.state.modalMode}
           entity={this.state.modalEntity}
           data={this.state.selectedItem}
           saleDetails={this.state.saleDetails}
           productList={mockProducts} 
           onChange={this.handleModalChange}
           onSave={this.saveMockChanges}
           onDetailChange={this.handleMockDetailChange}
           onDetailRemove={this.handleMockDetailRemove}
           onDetailAdd={this.handleMockDetailAdd}
        />
      </div>
    );
  }
}

export default withRouter(EditarEjercicio);