import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme/theme.js'; // Import your custom theme

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}> {/* Wrap App with ThemeProvider */}
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);