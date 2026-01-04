import React from 'react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import SalePanel from './SalePanel';
import SalesTable from './SalesTable';

class SimulationConfigurator extends React.Component {
  render() {
    const {
      // Product form
      newProduct,
      categoryList,
      onProductChange,
      onProductSubmit,
      // Product table
      products,
      currentPageProd,
      itemsPerPageProd,
      onPageChangeProd,
      onDeleteProduct,
      onViewProduct,
      onEditProduct,
      // Sale panel
      productList,
      currentSelection,
      onSelectionChange,
      addToCart,
      cart,
      removeFromCart,
      submitMultiProductSale,
      // Sales table
      sales,
      currentPageSale,
      itemsPerPageSale,
      onPageChangeSale,
      onCancelSale,
      onViewSale,
      onEditSale,
    } = this.props;

    return (
      <div>
        <div className="row g-4">
          <div className="col-12"><h6 className="border-bottom pb-2">Inventario</h6></div>
          <ProductForm newProduct={newProduct} categoryList={categoryList} onChange={onProductChange} onSubmit={onProductSubmit} />
          <ProductTable
            products={products}
            currentPage={currentPageProd}
            itemsPerPage={itemsPerPageProd}
            onPageChange={onPageChangeProd}
            onDelete={onDeleteProduct}
            onView={onViewProduct}
            onEdit={onEditProduct}
          />

          <div className="col-12 mt-4"><h6 className="border-bottom pb-2">Ventas</h6></div>
          <SalePanel productList={productList} currentSelection={currentSelection} onSelectionChange={onSelectionChange} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} submitMultiProductSale={submitMultiProductSale} />
          <SalesTable
            sales={sales}
            currentPage={currentPageSale}
            itemsPerPage={itemsPerPageSale}
            onPageChange={onPageChangeSale}
            onCancel={onCancelSale}
            onView={onViewSale}
            onEdit={onEditSale}
          />
        </div>
      </div>
    );
  }
}

export default SimulationConfigurator;
