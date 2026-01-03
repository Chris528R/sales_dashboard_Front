import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter} from 'react-router-dom';
import BootstrapReact from './modules/routes/BootstrapReact.jsx';
 
class Aplicacion extends React.Component {
render() {
      return(
    <BrowserRouter>
      <BootstrapReact />
    </BrowserRouter>
      );    
  }
}
 
export default Aplicacion;

const root = createRoot(document.getElementById('raiz'));
root.render(<Aplicacion />);