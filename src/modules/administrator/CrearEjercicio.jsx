import React, { Component } from 'react';
import GraphEditor from '../common/GraphEditor';
import DragDropEditor from '../common/DragDropEditor';
import SimulationConfigurator from '../common/SimulationConfigurator';
import { Navigate } from 'react-router-dom';
import ProductForm from '../common/ProductForm';
import ProductTable from '../common/ProductTable';
import SalePanel from '../common/SalePanel';
import SalesTable from '../common/SalesTable';
import SharedModal from '../common/SharedModal';

class CrearEjercicio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // --- ESTADO GENERAL ---
            titulo: '',
            nivel: 'Intermedio',
            tipoEjercicio: 'simulacion_dashboard', // 'drag_drop' | 'analisis_grafico' | 'simulacion_dashboard'
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

            // --- ESTADO: SIMULACIÓN DASHBOARD (MOCK DB) ---
            mockProducts: [],
            mockSales: [],
            
            
            // Formularios temporales para la simulación
            tempNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' },
            tempNewSale: { productId: '', quantity: 1 },
            tempCart: [],
            // Datos estáticos para selects
            categoryList: [
                { id: 1, nombre: 'Bebidas' }, { id: 2, nombre: 'Tecnologia' }, { id: 3, nombre: 'Limpieza' },
                { id: 4, nombre: 'Botanas' }, { id: 5, nombre: 'Abarrotes' }
            ],

            // Modal Compartido
            showModal: false,
            modalMode: 'VIEW',     // 'VIEW' o 'EDIT'
            modalEntity: 'PRODUCT', // 'PRODUCT' o 'SALE'
            selectedItem: {},      // El objeto que se está editando
            saleDetails: [],       // Detalles temporales para el modal de ventas

            //Paginacion
            currentPageProd: 1,
            currentPageSale: 1,
            itemsPerPage: 5,
        };
    }

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

    // A. Productos Simulados
    handleMockProductChange = (e) => {
        const { name, value } = e.target;
        this.setState(prev => ({ tempNewProduct: { ...prev.tempNewProduct, [name]: value } }));
    };

    submitMockProduct = (e) => {
        e.preventDefault();
        const { tempNewProduct, mockProducts } = this.state;
        const newProd = {
            ...tempNewProduct,
            id: Date.now(),
            stock: parseInt(tempNewProduct.stock),
            precio: parseFloat(tempNewProduct.precio)
        };
        this.setState({
            mockProducts: [...mockProducts, newProd],
            tempNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' }
        });
    };

    deleteMockProduct = (id) => {
        this.setState(prev => ({ mockProducts: prev.mockProducts.filter(p => p.id !== id) }));
    };

    // B. Ventas Simuladas
    handleMockSelectionChange = (changes) => {
        this.setState(prev => ({ tempNewSale: { ...prev.tempNewSale, ...changes } }));
    };

    addToMockCart = () => {
        const { tempNewSale, mockProducts } = this.state;
        const product = mockProducts.find(p => p.id == tempNewSale.productId);
        if (!product) return;
        const item = {
            id: product.id, nombre: product.nombre, precio: product.precio,
            cantidad: parseInt(tempNewSale.quantity),
            subtotal: parseInt(tempNewSale.quantity) * product.precio
        };
        this.setState(prev => ({
            tempCart: [...prev.tempCart, item],
            tempNewSale: { productId: '', quantity: 1 }
        }));
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

        const newSale = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            total: total,
            detalles: tempCart
        };

        const updatedProducts = mockProducts.map(prod => {
            const itemInCart = tempCart.find(item => item.id === prod.id);

            if (itemInCart) {
                return { ...prod, stock: Math.max(0, prod.stock - itemInCart.cantidad) };
            }
            return prod;
        });

        this.setState(prev => ({
            mockSales: [...prev.mockSales, newSale],
            mockProducts: updatedProducts,
            tempCart: []
        }));
    };

    // ==============================================================
    // LOGICA 4: CONTROL DEL MODAL (SIMULACIÓN)
    // ==============================================================

    // A. ABRIR MODAL (Carga datos de memoria, no de API)
    openMockModal = (mode, entity, item) => {
        let details = [];

        // Si es venta, los detalles YA están dentro del objeto en mockSales
        if (entity === 'SALE') {
            details = item.detalles ? [...item.detalles] : []; // Copia profunda simple
        }

        this.setState({
            showModal: true,
            modalMode: mode,
            modalEntity: entity,
            selectedItem: { ...item }, // Copia para no mutar directo el array
            saleDetails: details
        });
    };

    closeModal = () => {
        this.setState({ showModal: false, selectedItem: {}, saleDetails: [] });
    };

    // B. MANEJAR CAMBIOS EN INPUTS DEL MODAL
    handleModalChange = (e) => {
        const { name, value } = e.target;
        this.setState(prev => ({
            selectedItem: { ...prev.selectedItem, [name]: value }
        }));
    };

    // C. GUARDAR CAMBIOS (Actualiza mockProducts o mockSales)
    saveMockChanges = () => {
        const { modalEntity, selectedItem, saleDetails, mockProducts, mockSales } = this.state;

        if (modalEntity === 'PRODUCT') {
            // Actualizamos el producto en el array local
            const updatedProducts = mockProducts.map(p =>
                p.id === selectedItem.id ? selectedItem : p
            );
            this.setState({ mockProducts: updatedProducts, showModal: false });

        } else if (modalEntity === 'SALE') {
            // Recalcular total basado en los detalles modificados
            const newTotal = saleDetails.reduce((acc, item) => acc + item.subtotal, 0);

            // Actualizamos la venta con el nuevo total y los nuevos detalles
            const updatedSale = {
                ...selectedItem,
                total: newTotal,
                detalles: saleDetails
            };

            const updatedSales = mockSales.map(s =>
                s.id === selectedItem.id ? updatedSale : s
            );
            this.setState({ mockSales: updatedSales, showModal: false });
        }
    };

    // D. MANIPULAR DETALLES DE VENTA (Dentro del Modal)
    handleMockDetailChange = (index, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (qty < 1 || isNaN(qty)) return;

        this.setState(prevState => {
            const updatedDetails = [...prevState.saleDetails];
            const item = updatedDetails[index];
            item.cantidad = qty;
            item.subtotal = qty * item.precio; // Recalcular subtotal
            return { saleDetails: updatedDetails };
        });
    };

    handleMockDetailRemove = (index) => {
        this.setState(prevState => {
            const updatedDetails = [...prevState.saleDetails];
            updatedDetails.splice(index, 1);
            return { saleDetails: updatedDetails };
        });
    };

    handleMockDetailAdd = (productId) => {
        const { mockProducts, saleDetails } = this.state;
        const product = mockProducts.find(p => p.id == productId);
        if (!product) return;

        // Verificar si ya existe en la venta actual
        const existingIndex = saleDetails.findIndex(d => d.id === product.id);
        const updatedDetails = [...saleDetails];

        if (existingIndex >= 0) {
            updatedDetails[existingIndex].cantidad += 1;
            updatedDetails[existingIndex].subtotal = updatedDetails[existingIndex].cantidad * product.precio;
        } else {
            updatedDetails.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
                subtotal: product.precio
            });
        }
        this.setState({ saleDetails: updatedDetails });
    };

    // ==============================================================
    // GUARDADO FINAL (UNIFICADO)
    // ==============================================================
    handleSubmit = (e) => {
        e.preventDefault();
        const { titulo, nivel, tipoEjercicio, pregunta } = this.state;
        let jsonContent = {};

        // 1. Construir JSON según el tipo
        if (tipoEjercicio === 'drag_drop') {
            const { itemsDrag } = this.state;
            const drags = itemsDrag.map(i => ({ id: i.id, valor: i.nombre, imagen: "https://via.placeholder.com/150" }));
            const uniqueCats = [...new Set(itemsDrag.map(i => i.categoria))];
            const targets = uniqueCats.map(cat => ({
                valor: cat,
                aceptados: itemsDrag.filter(i => i.categoria === cat).map(i => i.id)
            }));
            jsonContent = { tipo: "drag_drop", pregunta, drags, targets };

        } else if (tipoEjercicio === 'analisis_grafico') {
            const { tipoGrafica, datosGrafica, opcionesRespuesta } = this.state;
            jsonContent = { tipo: "analisis_grafico", pregunta, tipoGrafica, datosGrafica, opciones: opcionesRespuesta };

        } else if (tipoEjercicio === 'simulacion_dashboard') {
            const { mockProducts, mockSales } = this.state;
            jsonContent = {
                tipo: "simulacion_dashboard",
                pregunta,
                datos_iniciales: { productos: mockProducts, ventas: mockSales }
            };
        }

        // 2. Enviar al Backend
        const formData = new URLSearchParams();
        formData.append('titulo', titulo);
        formData.append('nivel', nivel);
        formData.append('contenido', JSON.stringify(jsonContent));

        fetch('http://localhost:8080/api/ejercicios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') this.setState({ redirect: true });
                else alert('Error al guardar el ejercicio');
            });
    };


    render() {
        if (this.state.redirect) return <Navigate to="/administrator" />;

        const {
            tipoEjercicio, titulo, nivel, pregunta,
            itemsDrag, newItemDrag,
            tipoGrafica, datosGrafica, nuevoDatoGrafica, opcionesRespuesta, nuevaOpcion,
            mockProducts, mockSales, tempNewProduct, tempNewSale, tempCart, categoryList
        } = this.state;

        return (
            <div className="container mt-5 mb-5">
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
                <div className="card shadow-lg border-0">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Creador de Ejercicios</h4>
                    </div>

                    <div className="card-body">

                        {/* === HEADER COMÚN === */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Título del Ejercicio</label>
                                <input className="form-control" value={titulo} onChange={e => this.setState({ titulo: e.target.value })} placeholder="Ej: Repaso de Inventarios" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Nivel</label>
                                <select className="form-select" value={nivel} onChange={e => this.setState({ nivel: e.target.value })}>
                                    <option>Principiante</option><option>Intermedio</option><option>Avanzado</option>
                                </select>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label fw-bold text-primary">Tipo de Ejercicio</label>
                                <select className="form-select border-primary fw-bold" value={tipoEjercicio} onChange={e => this.setState({ tipoEjercicio: e.target.value })}>
                                    <option value="simulacion_dashboard">⭐ Simulación Completa (Dashboard)</option>
                                    <option value="drag_drop">🧩 Clasificación (Drag & Drop)</option>
                                    <option value="analisis_grafico">📊 Análisis de Gráficas</option>
                                </select>
                            </div>
                            <div className="col-12 mt-3">
                                <label className="form-label">Pregunta / Instrucción para el alumno</label>
                                <input className="form-control" value={pregunta} onChange={e => this.setState({ pregunta: e.target.value })}
                                    placeholder={tipoEjercicio === 'simulacion_dashboard' ? "Ej: Registra 2 ventas y elimina el producto X" : "Ej: Selecciona la opcion correcta..."} />
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* ========================================================
                CUERPO DINÁMICO SEGÚN EL TIPO DE EJERCICIO
               ======================================================== */}

                        {/* CASO A: SIMULACIÓN DASHBOARD */}
                        {tipoEjercicio === 'simulacion_dashboard' && (
                            <div>
                                <h5 className="text-primary fw-bold mb-3">🛠️ Configurar Estado Inicial (Base de Datos Falsa)</h5>
                                <p className="text-muted small">Usa los formularios para llenar las tablas con datos de prueba.</p>
                                <SimulationConfigurator
                                    newProduct={tempNewProduct}
                                    categoryList={categoryList}
                                    onProductChange={this.handleMockProductChange}
                                    onProductSubmit={this.submitMockProduct}

                                    products={mockProducts}
                                    currentPageProd={this.state.currentPageProd}
                                    itemsPerPageProd={this.state.itemsPerPage}
                                    onPageChangeProd={(page) => this.setState({ currentPageProd: page })}
                                    onDeleteProduct={this.deleteMockProduct}
                                    onViewProduct={(mode, entity, item) => this.openMockModal(mode, entity, item)}
                                    onEditProduct={(mode, entity, item) => this.openMockModal(mode, entity, item)}

                                    productList={mockProducts}
                                    currentSelection={tempNewSale}
                                    onSelectionChange={this.handleMockSelectionChange}
                                    addToCart={this.addToMockCart}
                                    cart={tempCart}
                                    removeFromCart={this.removeFromMockCart}
                                    submitMultiProductSale={this.submitMockSale}

                                    sales={mockSales}
                                    currentPageSale={this.state.currentPageProd}
                                    itemsPerPageSale={this.state.itemsPerPage}
                                    onPageChangeSale={(page) => this.setState({ currentPageProd: page })}
                                    onCancelSale={(id) => this.setState(p => ({ mockSales: p.mockSales.filter(s => s.id !== id) }))}
                                    onViewSale={(mode, entity, item) => this.openMockModal(mode, entity, item)}
                                    onEditSale={(mode, entity, item) => this.openMockModal(mode, entity, item)}
                                />
                            </div>
                        )}

                        {/* CASO B: DRAG & DROP */}
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

                        {/* CASO C: ANÁLISIS GRÁFICO */}
                        {tipoEjercicio === 'analisis_grafico' && (
                            <div>
                                {/* GraphEditor extraído a common */}
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
                            <button className="btn btn-success btn-lg" onClick={this.handleSubmit}>
                                💾 Guardar Ejercicio
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default CrearEjercicio;