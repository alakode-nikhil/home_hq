import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme.js';
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider> {/* Wrap App with AuthProvider */}
                <App />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
);