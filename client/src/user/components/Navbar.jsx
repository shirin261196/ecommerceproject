import React, { useContext, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled from 'styled-components';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';  
import { logout } from '../../redux/slices/authSlice';  
import { ShopContext } from '../../context/ShopContext';
import { selectCartItems } from '../../redux/slices/cartSlice';

const Logo = styled.img`
  width: 80px;
  height: 60px;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const NavbarComponent = () => {
  const { setShowSearch } = useContext(ShopContext);
  const dispatch = useDispatch();  
  const navigate = useNavigate();  
  const user = useSelector((state) => state.auth.user);
  const items = useSelector(selectCartItems);


// Calculate total cart item count
  // Memoized cart item count calculation
  const cartItemCount = useMemo(() => {
    return (items || []).reduce((count, item) => count + item.quantity, 0);
  }, [items]);


  // Fetch cart items when the component mounts
  useEffect(() => {
    if (user && user._id) {
      dispatch(selectCartItems(user._id));
      
    }
  }, [dispatch, user]);
  

  // Logout function to dispatch Redux action and navigate to login
  const handleLogout = () => {
    console.log("Logging out...");
    dispatch(logout());  // Dispatch logout action to clear user state and token
    console.log("Logged out successfully");
    navigate('/login');  // Redirect to login page after logout
  };

  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        {/* Logo */}
        <Navbar.Brand href="/">
          <Logo src={assets.Logo} alt="Logo" />
        </Navbar.Brand>

        {/* Navbar Toggle for mobile view */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/">HOME</Nav.Link>
            <Nav.Link as={NavLink} to="/collection">COLLECTION</Nav.Link>
            <Nav.Link as={NavLink} to="/about">ABOUT</Nav.Link>
            <Nav.Link as={NavLink} to="/contact">CONTACT</Nav.Link>
          </Nav>

          {/* Icons Container aligned to the far right */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            {/* Search Icon */}
            <Icon onClick={() => setShowSearch(true)} src={assets.search_icon} alt="Search" />

            {/* Profile Dropdown */}
            {user ? (
              <NavDropdown
                title={(
                  <>
                    <Icon src={assets.profile_icon} alt="Profile" />
                    <span className="ms-2">{user.name ? `Hi ${user.name}` : 'Profile'}</span> {/* Display user name or default */}
                  </>
                )}
                id="profile-dropdown"
              >
                <NavDropdown.Item as={NavLink} to="/profile">My Profile</NavDropdown.Item>
                
                <NavDropdown.Item as={NavLink} to="/orders">Orders</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={NavLink} to="/login">
                <Icon src={assets.profile_icon} alt="Profile" title="Login" />
              </Nav.Link>
            )}

            {/* Cart Icon with badge */}
            <Link to="/cart" className="position-relative">
              <Icon src={assets.cart_icon} alt="Cart" />
              {cartItemCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
