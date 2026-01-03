import React from 'react';

const Pagination = ({ totalItems = 0, currentPage = 1, itemsPerPage = 5, onPageChange = () => {} }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <div className="d-flex justify-content-end gap-2 mt-2">
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      > ◀ </button>
      <span className="align-self-center small">Pág {currentPage} de {totalPages}</span>
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      > ▶ </button>
    </div>
  );
};

export default Pagination;
