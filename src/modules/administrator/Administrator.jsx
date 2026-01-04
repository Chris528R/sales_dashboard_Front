import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Alert from '../common/Alert.jsx';

class Administrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exerciseList: [],

      alert: {
        show: false,
        type: '',
        message: ''
      },
      logout: false
    };
  }

  componentDidMount() {
    this.loadExercises();
  }

  loadExercises = () => {
    fetch('http://localhost:8080/api/ejercicios')
      .then(res => res.json())
      .then(data => {
        this.setState({ exerciseList: data });
      })
      .catch(err => {
        console.error("Error cargando ejercicios:", err);
        this.showAlert('error', 'Error al conectar con el servidor.');
      });
  };

  handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el ejercicio #${id}?`)) {

      fetch(`http://localhost:8080/api/ejercicios?id=${id}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const filtered = this.state.exerciseList.filter(ex => ex.id !== id);

            this.setState({
              exerciseList: filtered
            });
            this.showAlert('success', 'Ejercicio eliminado correctamente.');
          } else {
            this.showAlert('error', 'No se pudo eliminar el ejercicio.');
          }
        })
        .catch(err => {
          this.showAlert('error', 'Error de conexión al intentar eliminar.');
        });
    }
  };

  handleLogout = () => {
    localStorage.removeItem('user_session');
    
    this.setState({ logout: true });
  };

  showAlert = (type, message) => {
    this.setState({
      alert: { show: true, type, message }
    });
  };

  closeAlert = () => {
    this.setState(prev => ({
      alert: { ...prev.alert, show: false }
    }));
  };

  formatTime = (seconds) => {
    if (!seconds) return '--:--';
    return new Date(seconds * 1000).toISOString().substr(14, 5);
  };

  render() {
    if (this.state.logout) {
        return <Navigate to="/" />;
    }
    const { exerciseList, alert } = this.state;

    return (
      <div className="container mt-5">


        <Alert
          show={alert.show}
          type={alert.type}
          message={alert.message}
          onClose={this.closeAlert}
        />

        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h1 className="h3 text-primary fw-bold">Panel de Administrador</h1>
          </div>
          
          <div className="d-flex gap-2">
             <button 
                className="btn btn-outline-danger" 
                onClick={this.handleLogout}
             >
                Cerrar Sesión
             </button>
             <Link to="/crear-ejercicio" className="btn btn-success fw-bold shadow-sm">
                <span className="me-2">＋</span> Nuevo Ejercicio
             </Link>
          </div>
        </div>

        {/* --- TABLA DE EJERCICIOS --- */}
        <div className="card shadow border-0">
          <div className="card-header bg-white py-3">
            <h5 className="m-0 font-weight-bold text-secondary">Lista de Ejercicios Disponibles</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0 align-middle">
                <thead className="table-light text-uppercase small">
                  <tr>
                    <th scope="col" className="ps-4"># ID</th>
                    <th scope="col">Título del Ejercicio</th>
                    <th scope="col">Nivel / Categoría</th>
                    <th scope="col">Mejor Tiempo</th>
                    <th scope="col" className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseList.length > 0 ? (
                    exerciseList.map((exercise) => (
                      <tr key={exercise.id}>
                        <td className="ps-4 fw-bold text-muted">{exercise.id}</td>
                        <td className="fw-bold">{exercise.titulo}</td>
                        <td>
                          <span className={`badge ${exercise.nivel === 'Principiante' ? 'bg-info' :
                            exercise.nivel === 'Intermedio' ? 'bg-warning text-dark' : 'bg-danger'
                            }`}>
                            {exercise.nivel}
                          </span>
                        </td>
                        <td className="text-center font-monospace text-success fw-bold">
                          {exercise.mejorTiempo ? `🏆 ${this.formatTime(exercise.mejorTiempo)}` : <span className="text-muted small">-</span>}
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group" role="group">
                            <Link
                              to={`/ver-ejercicio/${exercise.id}`}
                              className="btn btn-outline-primary btn-sm"
                              title="Ver / Probar"
                            >
                              👁️ Ver / Probar
                            </Link>

                            <Link
                              to={`/editar-ejercicio/${exercise.id}`}
                              className="btn btn-outline-secondary btn-sm"
                              title="Editar"
                            >
                              ✏️ Editar
                            </Link>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              title="Eliminar"
                              onClick={() => this.handleDelete(exercise.id)}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        No hay ejercicios registrados. ¡Crea uno nuevo!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default Administrator;