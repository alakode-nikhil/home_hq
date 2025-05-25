import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            // Call login function from context
            await login(email, password); // Pass email and password
            // login(data.token, data.user); // Call login function from context
            navigate('/dashboard'); // Redirect to dashboard on success
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError(err.response && err.response.data.message
                ? err.response.data.message
                : 'Login failed. Please check your credentials.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                Sign in
            </Typography>
            {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Sign In
            </Button>
            <MuiLink component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
            </MuiLink>
        </Box>
    );
};

export default LoginPage;