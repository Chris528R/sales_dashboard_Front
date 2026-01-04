import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from '../login/Login.jsx';
import Administrator from '../administrator/Administrator.jsx';
import CrearEjercicio from '../administrator/CrearEjercicio.jsx';
import EditarEjercicio from '../administrator/EditarEjercicio.jsx';
import VerEjercicio from '../administrator/VerEjercicio.jsx';
import ProtectedRoute from '../common/ProtectedRoute.jsx';
import Footer from '../common/Footer.jsx';

class BootstrapReact extends React.Component {
  render() {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <div className="flex-grow-1">

            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/administrator" element={
                        <ProtectedRoute><Administrator /></ProtectedRoute>
                    } />
                    <Route path="/crear-ejercicio" element={
                        <ProtectedRoute><CrearEjercicio /></ProtectedRoute>
                    } />
                    <Route path="/editar-ejercicio/:id" element={
                        <ProtectedRoute><EditarEjercicio /></ProtectedRoute>
                    } />
                    <Route path="/ver-ejercicio/:id" element={
                        <ProtectedRoute><VerEjercicio /></ProtectedRoute>
                    } />
                  </Routes>
                </div>
              </div>
            </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default BootstrapReact;