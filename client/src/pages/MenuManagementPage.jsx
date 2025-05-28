// client/src/pages/MenuManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogActions,
    DialogContent, DialogTitle, List, ListItem, ListItemText,
    IconButton, Paper, Alert, CircularProgress,
    Snackbar
} from '@mui/material';
import { Edit, Delete, ChevronRight } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // To get the token
import {Link as RouterLink } from 'react-router-dom';

const MenuManagementPage = () => {
    const { token } = useAuth(); // Get the authentication token
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // State for Dialog (Add/Edit Menu)
    const [openDialog, setOpenDialog] = useState(false);
    const [currentMenu, setCurrentMenu] = useState(null); // Menu being edited, null for adding
    const [menuName, setMenuName] = useState('');
    const [menuOrder, setMenuOrder] = useState(0);

    // Fetch Menus from Backend
    const fetchMenus = async () => {
        setLoading(true);
        setError(null);
        try {
            // No auth header needed for GET /api/menus as it's public
            const response = await axios.get('/menus');
            // Sort by the new 'menuId' for consistent display
            setMenus(response.data.sort((a, b) => a.menuId - b.menuId));
        } catch (err) {
            console.error('Failed to fetch menus:', err);
            setError('Failed to load menus. Please try again.');
            showSnackbar('Failed to load menus.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    // Dialog Handlers
    const handleOpenAddDialog = () => {
        setCurrentMenu(null); // Clear current menu for 'Add' mode
        setMenuName('');
        setMenuOrder(menus.length > 0 ? Math.max(...menus.map(m => m.order)) + 1 : 0); // Suggest next order
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (menu) => {
        setCurrentMenu(menu); // Set menu for 'Edit' mode
        setMenuName(menu.name);
        setMenuOrder(menu.order);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentMenu(null);
        setMenuName('');
        setMenuOrder(0);
    };

    // Add/Update Menu Submission
    const handleSubmitMenu = async () => {
        setError(null); // Clear form-specific error
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const menuData = {
                name: menuName,
                order: Number(menuOrder),
            };

            if (currentMenu) {
                // Update existing menu
                await axios.put(`/menus/${currentMenu._id}`, menuData, config);
                showSnackbar('Menu updated successfully!', 'success');
            } else {
                // Add new menu
                await axios.post('/menus', menuData, config);
                showSnackbar('Menu added successfully!', 'success');
            }
            fetchMenus(); // Re-fetch menus to update the list
            handleCloseDialog(); // Close the dialog
        } catch (err) {
            console.error('Menu operation failed:', err);
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : 'An error occurred during menu operation.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        }
    };

    // Delete Menu
    const handleDeleteMenu = async (menuId) => {
        if (window.confirm('Are you sure you want to delete this menu? This will also affect associated submenus (they might become orphaned).')) {
            setError(null);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`/menus/${menuId}`, config);
                showSnackbar('Menu deleted successfully!', 'success');
                fetchMenus(); // Re-fetch menus
            } catch (err) {
                console.error('Failed to delete menu:', err);
                const errorMessage = err.response && err.response.data.message
                    ? err.response.data.message
                    : 'An error occurred during menu deletion.';
                setError(errorMessage);
                showSnackbar(errorMessage, 'error');
            }
        }
    };

    // Snackbar helper
    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // Check if add button should be disabled (based on 10 menu limit)
    const isAddButtonDisabled = menus.length >= 10;

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom component="h1">
                Menu Management
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                disabled={isAddButtonDisabled}
                sx={{ mb: 3 }}
            >
                {isAddButtonDisabled ? 'Maximum 10 Menus Reached' : 'Add New Menu'}
            </Button>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : menus.length === 0 ? (
                <Typography variant="body1" color="text.secondary">No menus found. Add your first menu!</Typography>
            ) : (
                <Paper elevation={2}>
                    <List>
                        {menus.map((menu) => (
                            <ListItem
                                key={menu._id}
                                divider
                                secondaryAction={
                                    <>
                                    {/* NEW: Button to navigate to Submenu Management */}
                                    <IconButton
                                        edge="end"
                                        aria-label="manage-submenus"
                                        component={RouterLink} // Use RouterLink for navigation
                                        to={`/admin/menus/${menu._id}/submenus`} // Dynamic URL based on menu._id
                                        sx={{ mr: 1 }} // Add some margin
                                    >
                                        <ChevronRight />
                                    </IconButton>

                                    {/* Existing Edit and Delete buttons */}
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(menu)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMenu(menu._id)}>
                                        <Delete />
                                    </IconButton>
                                    </>
                                }
                                >
                            <ListItemText
                            primary={menu.name}
                            secondary={`ID: ${menu.menuId} | Order: ${menu.order}`}
                        />
                        </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Add/Edit Menu Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentMenu ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Menu Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        id="order"
                        label="Order"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={menuOrder}
                        onChange={(e) => setMenuOrder(Number(e.target.value))}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmitMenu} variant="contained" color="primary">
                        {currentMenu ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MenuManagementPage;