// client/src/pages/SubmenuManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, Dialog, DialogActions,
    DialogContent, DialogTitle, List, ListItem, ListItemText,
    ListItemSecondaryAction, IconButton, Paper, Alert, CircularProgress,
    Snackbar, Select, MenuItem, InputLabel, FormControl, Breadcrumbs
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SubmenuManagementPage = () => {
    const { menuId } = useParams(); // Get menuId from URL (e.g., /admin/menus/abc123/submenus)
    const { token } = useAuth();
    const [submenus, setSubmenus] = useState([]);
    const [menuName, setMenuName] = useState(''); // To display the parent menu's name
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // State for Dialog (Add/Edit Submenu)
    const [openDialog, setOpenDialog] = useState(false);
    const [currentSubmenu, setCurrentSubmenu] = useState(null); // Submenu being edited, null for adding
    const [submenuName, setSubmenuName] = useState('');
    const [submenuOrder, setSubmenuOrder] = useState(0);
    const [templateType, setTemplateType] = useState('');
    const [contentItems, setContentItems] = useState(''); // Store as JSON string for now

    // Fetch Parent Menu Name and Submenus
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch parent menu details to display its name
            const menuRes = await axios.get(`/menus/${menuId}`); // Assuming you can GET a single menu by _id
            setMenuName(menuRes.data.name);

            // Fetch submenus for this menuId
            const submenuRes = await axios.get(`/submenus?menuId=${menuId}`);
            // Sort by 'order' for consistent display
            setSubmenus(submenuRes.data.sort((a, b) => a.order - b.order));
        } catch (err) {
            console.error('Failed to fetch submenu data:', err);
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : 'Failed to load submenu data. Please try again.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (menuId) {
            fetchData();
        }
    }, [menuId]); // Refetch if menuId changes

    // Dialog Handlers
    const handleOpenAddDialog = () => {
        setCurrentSubmenu(null);
        setSubmenuName('');
        setSubmenuOrder(submenus.length > 0 ? Math.max(...submenus.map(s => s.order)) + 1 : 0);
        setTemplateType('');
        setContentItems(''); // Clear content items
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (submenu) => {
        setCurrentSubmenu(submenu);
        setSubmenuName(submenu.name);
        setSubmenuOrder(submenu.order);
        setTemplateType(submenu.templateType);
        // Convert array back to JSON string for editing
        setContentItems(submenu.contentItems ? JSON.stringify(submenu.contentItems, null, 2) : '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentSubmenu(null);
        setSubmenuName('');
        setSubmenuOrder(0);
        setTemplateType('');
        setContentItems('');
        setError(null); // Clear dialog-specific errors
    };

    // Add/Update Submenu Submission
    const handleSubmitSubmenu = async () => {
        setError(null); // Clear form-specific error
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json', // Ensure content type is JSON
                },
            };

            let parsedContentItems = [];
            if (templateType !== 'submenu' && contentItems) {
                try {
                    parsedContentItems = JSON.parse(contentItems);
                    if (!Array.isArray(parsedContentItems)) {
                        throw new Error('Content items must be a JSON array.');
                    }
                } catch (e) {
                    setError('Invalid JSON for Content Items. Please ensure it\'s a valid JSON array.');
                    showSnackbar('Invalid JSON for Content Items.', 'error');
                    return; // Stop submission if JSON is invalid
                }
            }

            const submenuData = {
                name: submenuName,
                order: Number(submenuOrder),
                templateType: templateType,
                menuId: menuId, // Ensure menuId is always sent
            };

            // Only add contentItems to payload if templateType is not 'submenu'
            if (templateType !== 'submenu') {
                submenuData.contentItems = parsedContentItems;
            } else {
                // For 'submenu' type, ensure contentItems are not sent or are empty
                submenuData.contentItems = [];
            }

            if (currentSubmenu) {
                // Update existing submenu
                await axios.put(`/submenus/${currentSubmenu._id}`, submenuData, config);
                showSnackbar('Submenu updated successfully!', 'success');
            } else {
                // Add new submenu
                await axios.post('/submenus', submenuData, config);
                showSnackbar('Submenu added successfully!', 'success');
            }
            fetchData(); // Re-fetch submenus to update the list
            handleCloseDialog(); // Close the dialog
        } catch (err) {
            console.error('Submenu operation failed:', err);
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : 'An error occurred during submenu operation.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        }
    };

    // Delete Submenu
    const handleDeleteSubmenu = async (submenuId) => {
        if (window.confirm('Are you sure you want to delete this submenu?')) {
            setError(null);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`/submenus/${submenuId}`, config);
                showSnackbar('Submenu deleted successfully!', 'success');
                fetchData(); // Re-fetch submenus
            } catch (err) {
                console.error('Failed to delete submenu:', err);
                const errorMessage = err.response && err.response.data.message
                    ? err.response.data.message
                    : 'An error occurred during submenu deletion.';
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

    // Check if add button should be disabled (based on 5 submenu limit per menu)
    const isAddButtonDisabled = submenus.length >= 5;

    return (
        <Box sx={{ mt: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Button
                    variant="text"
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    startIcon={<ArrowBack />}
                >
                    Admin Dashboard
                </Button>
                <Button
                    variant="text"
                    color="inherit"
                    component={RouterLink}
                    to="/admin/menus"
                    startIcon={<ArrowBack />} // Maybe not back icon here, just for consistency
                >
                    Menu Management
                </Button>
                <Typography color="text.primary">Submenus for "{menuName || 'Loading...'}"</Typography>
            </Breadcrumbs>


            <Typography variant="h4" gutterBottom component="h1">
                Submenu Management for "{menuName || 'Loading...'}"
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                disabled={isAddButtonDisabled || loading} // Disable if limit reached or still loading parent menu name
                sx={{ mb: 3 }}
            >
                {isAddButtonDisabled ? 'Maximum 5 Submenus Reached' : 'Add New Submenu'}
            </Button>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : submenus.length === 0 ? (
                <Typography variant="body1" color="text.secondary">No submenus found for this menu. Add your first submenu!</Typography>
            ) : (
                <Paper elevation={2}>
                    <List>
                        {submenus.map((submenu) => (
                            <ListItem key={submenu._id} divider
                            secondaryAction={
                                <>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(submenu)}>
                                    <Edit />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSubmenu(submenu._id)}>
                                    <Delete />
                                </IconButton>
                                </>
                            }
                            >
                                <ListItemText
                                    primary={submenu.name}
                                    secondary={`Order: ${submenu.order} | Type: ${submenu.templateType} ${submenu.contentItems && submenu.contentItems.length > 0 ? `| Items: ${submenu.contentItems.length}` : ''}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Add/Edit Submenu Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentSubmenu ? 'Edit Submenu' : 'Add New Submenu'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Submenu Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={submenuName}
                        onChange={(e) => setSubmenuName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        id="order"
                        label="Order"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={submenuOrder}
                        onChange={(e) => setSubmenuOrder(Number(e.target.value))}
                        sx={{ mt: 2 }}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                        <InputLabel id="template-type-label">Template Type</InputLabel>
                        <Select
                            labelId="template-type-label"
                            id="template-type-select"
                            value={templateType}
                            label="Template Type"
                            onChange={(e) => setTemplateType(e.target.value)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="grid">Grid</MenuItem>
                            <MenuItem value="gallery">Gallery</MenuItem>
                            <MenuItem value="table">Table</MenuItem>
                            <MenuItem value="submenu">Submenu</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Conditionally render contentItems field */}
                    {templateType && templateType !== 'submenu' && (
                        <TextField
                            margin="dense"
                            id="contentItems"
                            label="Content Items (JSON Array)"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={contentItems}
                            onChange={(e) => setContentItems(e.target.value)}
                            sx={{ mt: 2 }}
                            helperText="Enter content items as a valid JSON array "                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmitSubmenu} variant="contained" color="primary">
                        {currentSubmenu ? 'Update' : 'Add'}
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

export default SubmenuManagementPage;