import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Sidebar Navigation Component.
 * Provides links to the main sections of the application.
 * Fixed to the left side of the screen.
 */
export const Sidebar: React.FC = () => {
    return (
        <div style={{ width: '250px', background: '#343a40', color: '#fff', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <h2 style={{ padding: '20px', margin: 0, borderBottom: '1px solid #4b545c' }}>Autoflex</h2>
            {/* Navigation Links */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>
                    <Link to="/products" style={{ color: '#c2c7d0', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #4b545c' }}>
                        📦 Produtos
                    </Link>
                </li>
                <li>
                    <Link to="/raw-materials" style={{ color: '#c2c7d0', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #4b545c' }}>
                        🪵 Matéria-prima
                    </Link>
                </li>
                <li>
                    <Link to="/production" style={{ color: '#c2c7d0', textDecoration: 'none', display: 'block', padding: '15px 20px', borderBottom: '1px solid #4b545c' }}>
                        🏭 Plano de Produção
                    </Link>
                </li>
            </ul>
        </div>
    );
};
