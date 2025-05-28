// client/src/pages/AdminDashboardPage.jsx
import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AdminDashboardPage = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom component="h1">
                Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Welcome to the administrator control panel. From here, you can manage application settings, menus, users, and more.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Menu Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Add, edit, or delete main navigation menus.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                component={RouterLink}
                                to="/admin/menus" // We'll create this route next
                            >
                                Manage Menus
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                User Management
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                View and manage user accounts and roles.
                            </Typography>
                            <Button
                                variant="outlined" // Use outlined for now, no route yet
                                color="secondary"
                                fullWidth
                                disabled // Disable until we build user management
                            >
                                Manage Users
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Add more admin cards as needed */}
            </Grid>
        </Box>
    );
};

export default AdminDashboardPage;