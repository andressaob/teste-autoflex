import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { ProductsPage } from './pages/ProductsPage';
import { RawMaterialsPage } from './pages/RawMaterialsPage';
import { ProductionPage } from './pages/ProductionPage';

/**
 * Main Application Component.
 * Configures the Routing (React Router) and the main Layout (Sidebar + Content Area).
 */
function App() {
  return (
    <Router>
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '250px', flex: 1, padding: '20px', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
                <Routes>
                    <Route path="/" element={<Navigate to="/products" />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/raw-materials" element={<RawMaterialsPage />} />
                    <Route path="/production" element={<ProductionPage />} />
                </Routes>
            </div>
        </div>
    </Router>
  );
}

export default App;
