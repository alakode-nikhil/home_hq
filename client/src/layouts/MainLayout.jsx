// client/src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth(); // Destructure user to get role

    const handleLogout = () => {
        logout();
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
                                Welcome, {user?.username || 'User'}!
                            </Typography>
                            {user?.role === 'admin' && ( // ONLY show if user is an admin
                                <Button color="inherit" component={RouterLink} to="/admin">
                                    Admin
                                </Button>
                            )}
                            <Button color="inherit" component={RouterLink} to="/dashboard">
                                Dashboard
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
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