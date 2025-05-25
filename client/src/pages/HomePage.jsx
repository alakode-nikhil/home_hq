import React from 'react';
import { Box, Typography } from '@mui/material';

const HomePage = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome to My Web Application!
            </Typography>
            <Typography variant="body1">
                This is the home page. Explore the dynamic menu, news feed, and calendar features.
            </Typography>
        </Box>
    );
};

export default HomePage;