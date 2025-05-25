import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const MainLayout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth(); // Use auth context

    const handleLogout = () => {
        logout(); // Call logout function from context
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                            My Web App
                        </RouterLink>
                    </Typography>
                    {isAuthenticated ? (
                        <>
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                Welcome, {user?.username || 'User'}! {/* Display username if available */}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/dashboard">
                                Dashboard
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">
                                Login
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/register">
                                Register
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;