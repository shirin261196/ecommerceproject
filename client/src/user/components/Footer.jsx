import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <div className="container py-5">
      <div className="row text-center text-md-start justify-content-center">
        {/* Logo and Description */}
        <div className="col-12 col-md-4 mb-4 mb-md-0">
          <img src={assets.Logo} className="mb-3" style={{ width: '80px' }} alt="KidzCorner Logo" />
          <p className="text-muted" style={{ fontSize: '13px' }}>
            Your trusted destination for stylish and high-quality kid's fashion. Our collections are designed with love, comfort, and durability in mind.
          </p>
        </div>

        {/* Company Links */}
        <div className="col-12 col-md-4 mb-4 mb-md-0">
          <p className="h5 mb-3">COMPANY</p>
          <ul className="list-unstyled text-muted" style={{ fontSize: '13px' }}>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="col-12 col-md-4">
          <p className="h5 mb-3">GET IN TOUCH</p>
          <ul className="list-unstyled text-muted" style={{ fontSize: '13px' }}>
            <li>+918137418148</li>
            <li>contact@kidzcorner.com</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-4">
        <hr className="my-3" />
        <p className="text-muted" style={{ fontSize: '13px' }}>
          &copy; 2024 kidzCorner.com - All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
