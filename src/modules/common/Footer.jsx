import React from 'react';

class Footer extends React.Component {
  render() {
    return (
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container">
          <div className="row align-items-center">
            
            {/* Lado Izquierdo: Integrantes del equipo */}
            <div className="col-md-6 text-center text-md-start">
              <h6 className="fw-bold text-warning">Equipo de Desarrollo:</h6>
              <ul className="list-unstyled mb-0 small">
                <li>Hernandez Vargas Uriel Yair</li>
                <li>Rocha Arellano Ximena Yulian</li>
                <li>Rodriguez Mendoza Christopher</li>
              </ul>
            </div>

            {/* Lado Derecho: Materia y Link */}
            <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
              <h6 className="mb-1">Análisis y diseño de Sistemas</h6>
              <a 
                href="https://www.escom.ipn.mx/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-info text-decoration-none small"
              >
                Visitar sitio de la ESCOM
              </a>
            </div>
            
          </div>
        </div>
      </footer>
    );
  }
};

export default Footer;