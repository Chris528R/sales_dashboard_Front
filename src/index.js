import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter} from 'react-router-dom';
import Dashboard from './componentes/DashBoard.jsx';
import Login from './modules/login/Login.jsx';
 
class Aplicacion extends React.Component {
render() {
      return(
    <BrowserRouter>
      <Login onLogin={Dashboard} />
    </BrowserRouter>
      );    
  }
}
 
export default Aplicacion;

const root = createRoot(document.getElementById('raiz'));
root.render(<Aplicacion />);