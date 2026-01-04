import React, { Component } from 'react';
import SimulationConfigurator from '../common/SimulationConfigurator';
import { useParams, Link } from 'react-router-dom';
import { FlexChart, FlexChartSeries, FlexPie, FlexChartAxis } from '@mescius/wijmo.react.chart';
import '@mescius/wijmo.styles/wijmo.css';
import ProductForm from '../common/ProductForm';
import ProductTable from '../common/ProductTable';
import SalePanel from '../common/SalePanel';
import SalesTable from '../common/SalesTable';

export function withRouter(Children) {
    return (props) => {
        const match = { params: useParams() };
        return <Children {...props} match={match} />
    }
}

class VerEjercicio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            titulo: '',
            nivel: '',
            tipo: '',
            instruccion: '',
            contenido: null, // El JSON crudo

            // ESTADO: JUEGO / RESULTADOS
            tiempo: 0,
            timerOn: false,
            resultado: null,
            mensajeFeedback: '',

            // --- ESTADO ESPECÍFICO: DRAG & DROP ---
            dragItems: [], // Items actuales
            selectedItem: null, // Item seleccionado para mover

            // --- ESTADO ESPECÍFICO: ANÁLISIS GRÁFICO ---
            opcionSeleccionada: null,

            // --- ESTADO ESPECÍFICO: SIMULACIÓN DASHBOARD ---
            simProducts: [],
            simSales: [],
            simCart: [], // Carrito de la simulación
            simSelection: { productId: '', quantity: 1 },
            simNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' }
        };
        this.interval = null;
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        fetch(`http://localhost:8080/api/ejercicios?id=${id}`)
            .then(res => res.json())
            .then(data => {
                const content = typeof data.contenido === 'string' ? JSON.parse(data.contenido) : data.contenido;

                this.setState({
                    loading: false,
                    titulo: data.titulo,
                    nivel: data.nivel,
                    tipo: content.tipo,
                    instruccion: content.pregunta,
                    contenido: content
                }, () => {
                    this.resetExercise();
                });
            });
    }

    resetExercise = () => {
        clearInterval(this.interval);
        const { contenido } = this.state;

        let cleanState = {
            tiempo: 0,
            timerOn: true,
            resultado: null,
            mensajeFeedback: '',
            selectedItem: null,
            opcionSeleccionada: null,
            simCart: [],
            simSelection: { productId: '', quantity: 1 },
            simNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' }
        };

        if (contenido.tipo === 'drag_drop') {
            cleanState.dragItems = contenido.drags.map(d => ({ ...d, placedIn: null }));
        }

        if (contenido.tipo === 'simulacion_dashboard') {
            cleanState.simProducts = JSON.parse(JSON.stringify(contenido.datos_iniciales.productos || []));
            cleanState.simSales = JSON.parse(JSON.stringify(contenido.datos_iniciales.ventas || []));
        }

        this.setState(cleanState, this.startTimer);
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    startTimer = () => {
        this.interval = setInterval(() => {
            this.setState(prev => ({ tiempo: prev.tiempo + 1 }));
        }, 1000);
    };

    stopTimer = () => {
        clearInterval(this.interval);
        this.setState({ timerOn: false });
    };

    saveBestTime = () => {
        const id = this.props.match.params.id;
        const { tiempo } = this.state;

        const formData = new URLSearchParams();
        formData.append('action', 'save_record');
        formData.append('id', id);
        formData.append('tiempo', tiempo);

        fetch('http://localhost:8080/api/ejercicios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        }).then(res => res.json())
            .then(data => console.log("Tiempo registrado"));
    };

    // =========================================================
    // LÓGICA 1: ANÁLISIS GRÁFICO
    // =========================================================
    verificarGrafico = () => {
        const { contenido, opcionSeleccionada } = this.state;
        if (!opcionSeleccionada) return;

        const correcta = contenido.opciones.find(op => op.esCorrecta);
        if (opcionSeleccionada === correcta.texto) {
            this.finishExercise(true, "Excelente analisis!");
        } else {
            this.finishExercise(false, "Respuesta incorrecta. Revisa la grafica nuevamente.");
        }
    };

    // =========================================================
    // LÓGICA 2: DRAG & DROP (Click & Match)
    // =========================================================
    handleDragClick = (item) => {
        if (this.state.resultado) return; // Bloquear si ya terminó
        this.setState({ selectedItem: item });
    };

    handleDropClick = (targetCategory) => {
        const { selectedItem, dragItems } = this.state;
        if (!selectedItem || this.state.resultado) return;

        const updatedItems = dragItems.map(it =>
            it.id === selectedItem.id ? { ...it, placedIn: targetCategory } : it
        );

        this.setState({ dragItems: updatedItems, selectedItem: null });
    };

    verificarDragDrop = () => {
        const { contenido, dragItems } = this.state;
        let aciertos = 0;
        let errores = 0;

        contenido.targets.forEach(target => {
            const itemsInBucket = dragItems.filter(it => it.placedIn === target.valor);

            itemsInBucket.forEach(it => {
                if (target.aceptados.includes(it.id)) aciertos++;
                else errores++;
            });
        });

        const totalItems = contenido.drags.length;
        if (aciertos === totalItems && errores === 0) {
            this.finishExercise(true, "Clasificacion perfecta!");
        } else {
            this.finishExercise(false, `Tienes ${errores} errores. Sigue intentando.`);
        }
    };

    // =========================================================
    // LÓGICA 3: SIMULACIÓN (DASHBOARD INTERACTIVO)
    // =========================================================
    simSubmitProduct = (e) => {
        e.preventDefault();
        const { simNewProduct, simProducts } = this.state;
        const newP = { ...simNewProduct, id: Date.now(), stock: parseInt(simNewProduct.stock), precio: parseFloat(simNewProduct.precio) };
        this.setState({
            simProducts: [...simProducts, newP],
            simNewProduct: { nombre: '', descripcion: '', precio: '', stock: '', categoria: 1, unidad: 'Pieza' }
        });
    };

    simSubmitSale = () => {
        const { simCart, simSales, simProducts } = this.state;
        if (simCart.length === 0) return;

        const total = simCart.reduce((acc, item) => acc + item.subtotal, 0);
        const newSale = { id: Date.now(), fecha: new Date().toLocaleTimeString(), total, detalles: simCart };

        // Descontar stock local
        const updatedProds = simProducts.map(p => {
            const inCart = simCart.find(c => c.id === p.id);
            return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.cantidad) } : p;
        });

        this.setState({
            simSales: [...simSales, newSale],
            simProducts: updatedProds,
            simCart: []
        });
    };

    // Funciones auxiliares para Simulation (Carro, Selects)
    simAddToCart = () => {
        const { simSelection, simProducts, simCart } = this.state;
        const p = simProducts.find(x => x.id == simSelection.productId);
        if (!p) return;
        const item = { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: parseInt(simSelection.quantity), subtotal: parseInt(simSelection.quantity) * p.precio };
        this.setState({ simCart: [...simCart, item] });
    };

    verificarSimulacion = () => {
        const { simSales, contenido } = this.state;
        const ventasIniciales = contenido.datos_iniciales.ventas.length;

        if (simSales.length > ventasIniciales) {
            this.finishExercise(true, "Simulacion completada! Has registrado nuevas transacciones.");
        } else {
            this.finishExercise(false, "No has registrado ninguna venta aun.");
        }
    };

    // =========================================================
    // FINALIZAR COMÚN
    // =========================================================
    finishExercise = (esCorrecto, mensaje) => {
        this.stopTimer(); // Detiene el contador
        this.setState({
            resultado: esCorrecto ? 'correcto' : 'incorrecto',
            mensajeFeedback: mensaje
        });

        if (esCorrecto) {
            // Guardar Récord en Backend
            this.saveBestTime();
        }
    };

    render() {
        const { loading, titulo, nivel, instruccion, tiempo, resultado, mensajeFeedback, tipo, contenido } = this.state;

        if (loading) return <div className="container mt-5 text-center"><h3>Cargando ejercicio...</h3></div>;

        return (
            <div className="container mt-4 mb-5">
                {/* HEADER CON CRONÓMETRO */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <Link to="/administrator" className="btn btn-outline-secondary btn-sm mb-2">← Volver</Link>
                        <h2>{titulo} <span className="badge bg-secondary fs-6">{nivel}</span></h2>
                    </div>
                    <div className="card bg-light border-primary">
                        <div className="card-body py-2 px-4 text-center">
                            <small className="text-muted text-uppercase">Tiempo</small>
                            <h3 className="mb-0 font-monospace">{new Date(tiempo * 1000).toISOString().substr(14, 5)}</h3>
                        </div>
                    </div>
                </div>

                {/* INSTRUCCIÓN */}
                <div className="alert alert-info shadow-sm border-0">
                    <strong> Instrucción: </strong> {instruccion}
                </div>

                <div className="card shadow-lg border-0">
                    <div className="card-body p-4">

                        {/* ---------------- CASO A: ANÁLISIS GRÁFICO ---------------- */}
                        {tipo === 'analisis_grafico' && (
                            <div className="row">
                                <div className="col-md-8">
                                    <div style={{ height: '350px' }}>
                                        {contenido.tipoGrafica === 'pastel' ?
                                            <FlexPie itemsSource={contenido.datosGrafica} binding="valor" bindingName="nombre" innerRadius={0.5} /> :
                                            <FlexChart itemsSource={contenido.datosGrafica} bindingX="nombre" rotated={contenido.tipoGrafica === 'barras'} chartType={contenido.tipoGrafica === 'barras' ? 'Bar' : 'Line'}>
                                                <FlexChartSeries binding="valor" name="Valor" />
                                            </FlexChart>
                                        }
                                    </div>
                                </div>
                                <div className="col-md-4 d-flex flex-column justify-content-center">
                                    <h5 className="mb-3">Selecciona la respuesta:</h5>
                                    <div className="d-grid gap-2">
                                        {contenido.opciones.map((op, i) => (
                                            <button key={i} className={`btn ${this.state.opcionSeleccionada === op.texto ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.setState({ opcionSeleccionada: op.texto, resultado: null })}>
                                                {op.texto}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="btn btn-success mt-4 fw-bold" onClick={this.verificarGrafico}>Verificar Respuesta</button>
                                </div>
                            </div>
                        )}

                        {/* ---------------- CASO B: DRAG & DROP ---------------- */}
                        {tipo === 'drag_drop' && (
                            <div className="row">
                                {/* ITEMS (Izquierda) */}
                                <div className="col-md-5">
                                    <h6 className="text-center text-muted border-bottom pb-2">Elementos</h6>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {this.state.dragItems.filter(i => !i.placedIn).map(item => (
                                            <div key={item.id}
                                                className={`card p-2 cursor-pointer ${this.state.selectedItem?.id === item.id ? 'border-primary bg-light' : ''}`}
                                                style={{ width: '120px', cursor: 'pointer' }}
                                                onClick={() => this.handleDragClick(item)}
                                            >
                                                <div className="text-center small mt-1 fw-bold">{item.valor}</div>
                                            </div>
                                        ))}
                                        {this.state.dragItems.filter(i => !i.placedIn).length === 0 && <p className="text-muted small mt-5">Todo clasificado.</p>}
                                    </div>
                                </div>

                                {/* TARGETS (Derecha) */}
                                <div className="col-md-7 border-start">
                                    <h6 className="text-center text-muted border-bottom pb-2">Categorías (Click para soltar)</h6>
                                    <div className="row g-2">
                                        {contenido.targets.map((target, i) => (
                                            <div key={i} className="col-6">
                                                <div className="card h-100 border-2 border-dashed" onClick={() => this.handleDropClick(target.valor)} style={{ cursor: 'pointer', minHeight: '120px' }}>
                                                    <div className="card-header text-center small fw-bold bg-light">{target.valor}</div>
                                                    <div className="card-body p-1 d-flex flex-wrap gap-1 justify-content-center align-content-start">
                                                        {this.state.dragItems.filter(it => it.placedIn === target.valor).map(it => (
                                                            <span key={it.id} className="badge bg-primary pointer" onClick={(e) => { e.stopPropagation();  }}>
                                                                {it.valor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <button className="btn btn-success fw-bold px-5" onClick={this.verificarDragDrop}>Calificar Clasificación</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ---------------- CASO C: SIMULACIÓN DASHBOARD ---------------- */}
                        {tipo === 'simulacion_dashboard' && (
                            <div>
                                <div className="row g-3">
                                    {/* Aquí reutilizamos tus componentes pero pasándole el estado local 'sim...' */}
                                    <SimulationConfigurator
                                        newProduct={this.state.simNewProduct}
                                        categoryList={[]}
                                        onProductChange={(e) => this.setState(p => ({ simNewProduct: { ...p.simNewProduct, [e.target.name]: e.target.value } }))}
                                        onProductSubmit={this.simSubmitProduct}

                                        products={this.state.simProducts}
                                        currentPageProd={1}
                                        itemsPerPageProd={5}
                                        onPageChangeProd={() => {}}
                                        onDeleteProduct={(id) => this.setState(p => ({ simProducts: p.simProducts.filter(x => x.id !== id) }))}
                                        onViewProduct={() => { }}
                                        onEditProduct={() => { }}

                                        productList={this.state.simProducts}
                                        currentSelection={this.state.simSelection}
                                        onSelectionChange={(c) => this.setState(p => ({ simSelection: { ...p.simSelection, ...c } }))}
                                        addToCart={this.simAddToCart}
                                        cart={this.state.simCart}
                                        removeFromCart={(idx) => { const c = [...this.state.simCart]; c.splice(idx, 1); this.setState({ simCart: c }) }}
                                        submitMultiProductSale={this.simSubmitSale}

                                        sales={this.state.simSales}
                                        currentPageSale={1}
                                        itemsPerPageSale={5}
                                        onPageChangeSale={() => {}}
                                        onCancelSale={() => { }}
                                        onViewSale={() => { }}
                                        onEditSale={() => { }}
                                    />
                                </div>
                                <div className="text-center mt-4 border-top pt-3">
                                    <button className="btn btn-success btn-lg" onClick={this.verificarSimulacion}>Terminar Simulación</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* FEEDBACK FINAL */}
                {resultado && (
                    <div className={`alert mt-3 text-center shadow ${resultado === 'correcto' ? 'alert-success' : 'alert-danger'}`}>
                        <h2 className="fw-bold mb-0">{resultado === 'correcto' ? 'Correcto!' : 'Incorrecto'}</h2>
                        <p className="fs-5">{mensajeFeedback}</p>
                        {resultado === 'incorrecto' && (
                            <button className="btn btn-sm btn-outline-danger mt-2"
                                onClick={this.resetExercise}>
                                Intentar de nuevo
                            </button>
                        )}
                        {resultado === 'correcto' && (
                            <Link to="/administrator" className="btn btn-sm btn-success mt-2">Continuar</Link>
                        )}
                    </div>
                )}

            </div>
        );
    }
}

export default withRouter(VerEjercicio);