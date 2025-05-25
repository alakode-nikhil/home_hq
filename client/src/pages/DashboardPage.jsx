import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardPage = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1">
                Welcome to your personalized dashboard! This is a protected route.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
                Here you will see your uploaded files, events, and other relevant information.
            </Typography>
        </Box>
    );
};

export default DashboardPage;