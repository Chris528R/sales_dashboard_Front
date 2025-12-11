import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from '../login/Login.jsx';
import Administrator from '../administrator/Administrator.jsx';
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
                    <Route path="/administrator" element={<Administrator />} />
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