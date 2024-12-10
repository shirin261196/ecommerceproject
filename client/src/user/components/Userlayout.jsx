import React from "react";
import Navbar from "../../user/components/Navbar.jsx";
import Footer from "../../user/components/Footer.jsx";
import Searchbar from "../..//user/components/Searchbar";
import { Outlet } from "react-router-dom";

const Userlayout = () => {
    return (
        <>
          <Navbar />
          <Searchbar />
          <div className="content">
            <Outlet />
          </div>
          <Footer />
        </>
      );
    };

export default Userlayout;
