import React, { use } from 'react';
import {Navigate, redirect} from "react-router-dom"
import Alert from '../common/Alert.jsx';
import fondoLogin from '../../images/fondo_login.jpg'

class Login extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      credentials: { user: '', password: '' },
      alert: { show: false, message: '', type: '' },
      redirect: false
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      credentials: {
        ...prevState.credentials,
        [name]: value,
      },
    }));
  }

  handleLogin = (event) => {
    event.preventDefault();
    const { user, password } = this.state.credentials;

    const formData = new URLSearchParams();
    formData.append('nombre', user);
    formData.append('cont', password);

    fetch('http://localhost:8080/dist/api/login', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      body: formData // Enviamos formData en lugar de JSON string
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        this.setState({
          alert: { show: true, message: 'Inicio de sesión exitoso', type: 'success' },
        });
        
      } else {
        this.setState({
          alert: { show: true, message: 'Credenciales inválidas', type: 'danger' },
          credentials: { user: '', password: '' }
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      this.setState({
        alert: { show: true, message: 'Error en la conexión', type: 'danger' },
      });
    });
  }

  closeAlert = () => {
    this.setState((prevState) => ({
      alert: { ...prevState.alert, show: false }
    }));

    if (this.state.alert.type === 'success') {
      this.setState({ redirect: true });
    }
  }


  render() {

    if (this.state.redirect) {
      return <Navigate to="/administrator" />;
    }

    const { alert, credentials } = this.state;

    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>

        <Alert 
          show={alert.show} 
          type={alert.type}
          message={alert.message}
          onClose={this.closeAlert}
        />

        <div className="card shadow-lg overflow-hidden" style={{ maxWidth: '900px', width: '100%' }}>
          <div className="row g-0">
          
          {/* Lado izquierdo: Bienvenida (Visible solo en MD o superior) */}
          <div className="col-md-6 d-none d-md-flex bg-primary text-white flex-column justify-content-center align-items-center p-5"
          style={{
            backgroundImage: `url(${fondoLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <h1 className="fw-bold display-5">Bienvenido</h1>
            <h1 className="fw-light display-6">de nuevo</h1>
          </div>

          {/* Lado derecho: Formulario */}
          <div className="col-md-6 p-5 bg-white">
            <h2 className="mb-4 fw-bold text-center text-dark">Iniciar Sesión</h2>
            <form onSubmit={this.handleLogin}>
              <div className="mb-3">
                <input 
                  type="text" 
                  name='user'
                  className="form-control form-control-lg" 
                  placeholder="Usuario" 
                  value={credentials.user}
                  onChange={this.handleInputChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <input 
                  type="password" 
                  name='password'
                  className="form-control form-control-lg" 
                  placeholder="Contraseña" 
                  value={credentials.password}
                  onChange={this.handleInputChange}
                  required 
                />
              </div>
              
              <button type="submit" className="btn btn-warning w-100 fw-bold py-2">
                Iniciar Sesión
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
    );
  }
};

export default Login;