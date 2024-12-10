import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectFilteredProducts } from '../../redux/slices/productSlice';
import { assets } from '../../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { backendUrl } from '../../App';
import axios from 'axios';

const Collection = () => {
  const dispatch = useDispatch();

  // Use selectors for products and loading state
  const products  = useSelector(selectFilteredProducts);
  const isLoading = useSelector((state) => state.products.loading);

  const [showFilter, setShowFilter] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch products on component mount
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

    // Fetch active categories on component mount
    useEffect(() => {
      const fetchActiveCategories = async () => {
          try {
              const response = await axios.get(`${backendUrl}/admin/category/active`);
              if (response.data.success) {
                  setCategories(response.data.data);
              } else {
                  console.error(response.data.message);
              }
          } catch (error) {
              console.error('Failed to fetch categories');
          }
      };

      fetchActiveCategories();
  }, []);

     // Filter and sort products
     const filteredProducts = products.filter((item) =>
      selectedCategories.length > 0 ? selectedCategories.includes(item.category) : true
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortType) {
      case 'low-to-high':
        return a.price - b.price;
      case 'high-to-low':
        return b.price - a.price;
      default:
        return 0; // Default order (relevant)
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Toggle category selection
  const toggleCategory = (e) => {
    const value = e.target.value;
    setSelectedCategories((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
};

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filter Options */}
        <div className="col-12 col-md-3 mb-4">
          <div>
            <p
              className="d-flex align-items-center cursor-pointer fw-bold mb-2"
              onClick={() => setShowFilter(!showFilter)}
            >
              FILTERS
              <img
                className={`ms-2 ${showFilter ? 'rotate-90' : ''}`}
                src={assets.dropdown_icon}
                alt="Toggle Filters"
                style={{ height: '10px' }}
              />
            </p>

            {/* Category Filter */}
            <div className={`border p-3 ${showFilter ? '' : 'd-none'}`}>
                            <p className="mb-3 fw-semibold">CATEGORIES</p>
                            <div className="d-flex flex-column gap-2 text-muted">
                                {categories.map((cat) => (
                                    <div className="d-flex align-items-center gap-2" key={cat._id}>
                                        <input
                                            type="checkbox"
                                            value={cat.name}
                                            onChange={toggleCategory}
                                            className="form-check-input me-2"
                                        />
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

        {/* Product Listing */}
        <div className="col-12 col-md-9">
          {/* Header and Sort Option */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Title text1="ALL " text2="COLLECTION" />
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="form-select w-auto"
            >
              <option value="relevant">Sort by: Relevant</option>
              <option value="low-to-high">Sort by: Low to High</option>
              <option value="high-to-low">Sort by: High to Low</option>
            </select>
          </div>

          {/* Product Items */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
            {currentProducts.map((item, index) => {
              const imageUrl = item.images?.[0]?.url || '/path/to/default-image.jpg';

              return (
                <div className="col" key={index}>
                  <ProductItem
                    name={item.name}
                    id={item._id}
                    price={item.price}
                    stock={item.stock}
                    image={imageUrl}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
