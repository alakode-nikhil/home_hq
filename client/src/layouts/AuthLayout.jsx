import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

const AuthLayout = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default', // Use our theme background color
                p: 2,
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        mt: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'white',
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        My Web App
                    </Typography>
                    <Outlet /> {/* This will render the LoginPage or RegisterPage */}
                </Box>
            </Container>
        </Box>
    );
};

export default AuthLayout;