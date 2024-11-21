import React, { useState } from 'react';
import styled from 'styled-components';
import { backendUrl } from '../App'; // Ensure backendUrl is imported correctly
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Card = styled.div`
  background-color: white;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Login = ({setToken}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(`${backendUrl}/admin/login`, { email, password });
  
      console.log('Backend Response:', response.data);  // Check the console
  
      if (response.data.token) {
        // If there's a token, consider it a success
        const token = response.data.token;
        localStorage.setItem('token', token);
        setToken(token); // Update parent state
        toast.success('Login successful!');
        navigate('/admin/products');
      } else {
        // Show the error message if there's no token
        toast.error(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };
  
  
  

  return (
    <Container>
      <Card>
        <Title>Admin Panel</Title>
        <form onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Login</Button>
        </form>
      </Card>
    </Container>
  );
};

export default Login;
