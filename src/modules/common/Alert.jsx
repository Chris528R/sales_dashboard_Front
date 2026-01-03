import React from 'react';
import { Modal, Button } from 'react-bootstrap';

class Alert extends React.Component {
  render() {
    const { show, onClose, type, message } = this.props;
    const isSuccess = type === 'success';
    const title = isSuccess ? 'Exito!' : 'Error';
    const buttonVariant = isSuccess ? 'success' : 'danger';
    const headerBg = isSuccess ? 'bg-success' : 'bg-danger';

    return (
      <Modal
        show={show}
        onHide={onClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        {/* Cabecera del Modal con color según el tipo */}
        <Modal.Header className={`${headerBg} text-white justify-content-center`}>
          <Modal.Title className="fw-bold">
            {title}
          </Modal.Title>
        </Modal.Header>

        {/* Cuerpo del Modal con el mensaje */}
        <Modal.Body className="text-center p-4 fs-5">
          {message}
        </Modal.Body>

        {/* Pie del Modal con el botón de Aceptar */}
        <Modal.Footer className="justify-content-center border-0 pb-4">
          <Button variant={buttonVariant} onClick={onClose} className="px-5 fw-bold ls-1">
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
};

export default Alert;