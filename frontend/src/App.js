import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AuthNav from './components/AuthNav';
import Login from './components/Login';
import Header from './components/layout/Header';
import Home from './components/Home';
import Register from './components/Register';
import ContactUs from './components/ContactUs';
import Terms from './components/Terms';
import Blog from './components/Blog';
import Profile from './components/Profile';
import Footer from './components/layout/Footer';
import Knatty from "./components/Knatty";


function App() {
  const location = useLocation();

  const [isAuth, setIsAuth] = useState(() => {
    return localStorage.getItem('isAuth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuth', isAuth);
  }, [isAuth]);

  return (
    <>
      <Header isAuth={isAuth} setIsAuth={setIsAuth} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<AuthNav isAuth={isAuth}><Blog /></AuthNav>} />
        <Route path="/profile" element={<AuthNav isAuth={isAuth}><Profile /></AuthNav>} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      {!['/login', '/register'].includes(location.pathname) && <Footer />}
      {!['/login', '/register'].includes(location.pathname) && <Knatty />}
    </>
  );
}

export default App;