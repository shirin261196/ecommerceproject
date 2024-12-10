import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { useSelector } from 'react-redux';

const Relatedproducts = ({ category }) => {
  const products = useSelector((state) => state.products.products); // Corrected the selector
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products?.length > 0) { // Safely check for products array
      // Filter products based on the category
      const filteredProducts = products.filter(
        (item) => item.category === category
      );

      // Get the first 5 related products
      setRelated(filteredProducts.slice(0, 5));
    }
  }, [products, category]); // Include category in dependency array

  return (
    <div className="my-5">
      <div className="text-center mb-4">
        <Title text1={'RELATED '} text2={'PRODUCTS'} />
      </div>
      <div className="row justify-content-center">
        {related.map((item) => (
          <div key={item._id} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <ProductItem
              id={item._id}
              name={item.name}
              price={item.price}
              stock={item.stock}
              // Use the first image's URL or fallback
              image={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Relatedproducts;
