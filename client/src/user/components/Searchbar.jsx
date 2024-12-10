import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { assets } from '../../assets/assets';
import { useLocation } from 'react-router-dom';

const Searchbar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [visible,setVisible] = useState(false)
  const location =useLocation();

  useEffect(()=>{
    if(location.pathname.includes('collection')){
        setVisible(true);
    }
    else{
        setVisible(false)
    }
  },[location])

  return showSearch && visible ? (
    <div className="border-top border-bottom bg-light text-center py-2">
      <div className="d-flex align-items-center justify-content-center mx-auto" style={{ maxWidth: '500px' }}>
        <div className="d-flex align-items-center border p-1 flex-grow-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control border-0"
            type="text"
            placeholder="Search"
            style={{ flex: '1' }}
          />
          <img
            className="img-fluid ms-2"
            src={assets.search_icon}
            alt="Search"
            style={{ width: '20px', height: '20px' }}
          />
        </div>
        <img
          onClick={() => setShowSearch(false)}
          className="img-fluid ms-3 cursor-pointer"
          src={assets.cross_icon}
          alt="Close"
          style={{ width: '20px', height: '20px' }}
        />
      </div>
    </div>
  ) : null;
};

export default Searchbar;
