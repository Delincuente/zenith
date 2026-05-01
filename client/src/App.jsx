import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Layout from './components/Layout';
import PageWrapper from './components/PageWrapper';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Clients from './pages/Clients';
import Profile from './pages/Profile';
import PlanPricing from './pages/PlanPricing';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="projects" element={<PageWrapper><Projects /></PageWrapper>} />
          <Route path="tasks" element={<PageWrapper><Tasks /></PageWrapper>} />
          <Route path="clients" element={<PageWrapper><Clients /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="plans" element={<PageWrapper><PlanPricing /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid #1e293b'
        }
      }} />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;

