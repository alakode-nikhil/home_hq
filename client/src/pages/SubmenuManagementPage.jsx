// client/src/pages/SubmenuManagementPage.jsx (now handles children of Menus or Submenus)
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, Dialog, DialogActions,
    DialogContent, DialogTitle, List, ListItem, ListItemText, IconButton, Paper, Alert, CircularProgress,
    Snackbar, Select, MenuItem, InputLabel, FormControl, Breadcrumbs
} from '@mui/material';
import { Edit, Delete, ArrowBack, AddCircleOutline } from '@mui/icons-material'; // Added AddCircleOutline
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChildrenManagementPage = () => { // Renamed component for clarity
    // Get parentId and parentModel from URL (e.g., /admin/nav/Menu/abc12345/children)
    const { parentModel, parentId } = useParams();
    console.log('useParams extracted:');
    console.log('parentid:', parentId);
    console.log('parentModel:', parentModel);

    const { token } = useAuth();

    const [children, setChildren] = useState([]); // Now 'children' instead of 'submenus'
    const [parentName, setParentName] = useState(''); // To display the parent's name
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // State for Dialog (Add/Edit Child)
    const [openDialog, setOpenDialog] = useState(false);
    const [currentChild, setCurrentChild] = useState(null); // Child being edited, null for adding
    const [childName, setChildName] = useState('');
    const [childOrder, setChildOrder] = useState(0);
    const [templateType, setTemplateType] = useState('');
    const [contentItems, setContentItems] = useState(''); // Store as JSON string for now

    // Fetch Parent Name and Children
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            let parentRes;
            // Determine which endpoint to call based on parentModel
            if (parentModel === 'Menu') {
                parentRes = await axios.get(`/menus/${parentId}`);
            } else if (parentModel === 'Submenu') {
                parentRes = await axios.get(`/submenus/${parentId}`);
            } else {
                throw new Error('Invalid parent model specified in URL.');
            }
            setParentName(parentRes.data.name);
            console.log('Attempting to fetch children with URL:', `/submenus?parentId=<span class="math-inline">\{parentId\}&parentModel\=</span>{parentModel}`);

            // Fetch children for this parentId and parentModel
            const childrenRes = await axios.get(`/submenus?parentId=${parentId}&parentModel=${parentModel}`);

            // Sort by 'order' for consistent display
            setChildren(childrenRes.data.sort((a, b) => a.order - b.order));
        } catch (err) {
            console.error('Failed to fetch children data:', err);
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : 'Failed to load children data. Please try again.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch data only if parentId and parentModel are present in URL
        if (parentId && parentModel) {
            fetchData();
        }
    }, [parentId, parentModel]); // Refetch if parentId or parentModel changes

    // Dialog Handlers
    const handleOpenAddDialog = () => {
        setCurrentChild(null);
        setChildName('');
        // Suggest next order based on existing children
        setChildOrder(children.length > 0 ? Math.max(...children.map(c => c.order)) + 1 : 0);
        setTemplateType('');
        setContentItems('');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (child) => {
        setCurrentChild(child);
        setChildName(child.name);
        setChildOrder(child.order);
        setTemplateType(child.templateType);
        // Convert array back to JSON string for editing
        setContentItems(child.contentItems ? JSON.stringify(child.contentItems, null, 2) : '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentChild(null);
        setChildName('');
        setChildOrder(0);
        setTemplateType('');
        setContentItems('');
        setError(null); // Clear dialog-specific errors
    };

    // Add/Update Child Submission
    const handleSubmitChild = async () => {
        setError(null);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            let parsedContentItems = [];
            // Only parse contentItems if templateType is not 'submenu' AND contentItems string is not empty
            if (templateType && templateType !== 'submenu' && contentItems) {
                try {
                    parsedContentItems = JSON.parse(contentItems);
                    if (!Array.isArray(parsedContentItems)) {
                        throw new Error('Content items must be a JSON array.');
                    }
                } catch (e) {
                    setError('Invalid JSON for Content Items. Please ensure it\'s a valid JSON array.');
                    showSnackbar('Invalid JSON for Content Items.', 'error');
                    return;
                }
            }

            const childData = {
                name: childName,
                order: Number(childOrder),
                templateType: templateType,
                parentId: parentId,     // <--- Crucial: Use current parentId from URL
                parentModel: parentModel, // <--- Crucial: Use current parentModel from URL
            };

            if (templateType !== 'submenu') {
                childData.contentItems = parsedContentItems;
            } else {
                childData.contentItems = []; // Ensure contentItems are empty for 'submenu' type
            }

            if (currentChild) {
                // Update existing child
                await axios.put(`/submenus/${currentChild._id}`, childData, config);
                showSnackbar('Child updated successfully!', 'success');
            } else {
                // Add new child
                await axios.post('/submenus', childData, config);
                showSnackbar('Child added successfully!', 'success');
            }
            fetchData(); // Re-fetch children to update the list
            handleCloseDialog();
        } catch (err) {
            console.error('Child operation failed:', err);
            const errorMessage = err.response && err.response.data.message
                ? err.response.data.message
                : 'An error occurred during child operation.';
            setError(errorMessage);
            showSnackbar(errorMessage, 'error');
        }
    };

    // Delete Child
    const handleDeleteChild = async (childId) => {
        if (window.confirm('Are you sure you want to delete this item? If it is a parent to other submenus, they will become orphaned.')) {
            setError(null);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`/submenus/${childId}`, config);
                showSnackbar('Child deleted successfully!', 'success');
                fetchData(); // Re-fetch children
            } catch (err) {
                console.error('Failed to delete child:', err);
                const errorMessage = err.response && err.response.data.message
                    ? err.response.data.message
                    : 'An error occurred during child deletion.';
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

    // Check if add button should be disabled (based on 5 child limit per parent)
    const isAddButtonDisabled = children.length >= 5;

    // Determine the previous path for breadcrumbs/back button
    let backPath = '/admin/menus'; // Default back to menu management

    // If parentModel is 'Submenu', we need to go back to its parent
    // This is complex for arbitrary nesting without knowing the grandparent
    // For simplicity, for now, we'll go back to MenuManagement for any level.
    // A full solution for breadcrumbs in arbitrary nesting would need a stack of visited parents.
    // For now, let's make a decision: back to parentMenu for submenus, or a specific admin page.
    // Let's create a simpler breadcrumb for now that goes to MenuManagementPage if parent is a menu,
    // or just indicates the current path if it's a submenu.
    const breadcrumbLinks = [
        <Button
            variant="text"
            color="inherit"
            component={RouterLink}
            to="/admin"
            startIcon={<ArrowBack />}
            key="admin-dash"
        >
            Admin Dashboard
        </Button>,
        <Button
            variant="text"
            color="inherit"
            component={RouterLink}
            to="/admin/menus"
            key="menu-mgmt"
        >
            Menu Management
        </Button>,
    ];
    // If the current parent is a Submenu, we add its path to breadcrumbs
    // Note: For true multi-level breadcrumbs, you'd need to fetch ancestor names.
    // For simplicity, we'll just show the current parent name.
    if (parentModel === 'Submenu') {
         // You'd ideally link to the parent's parent here.
         // For now, we'll just show the current level.
    }
    breadcrumbLinks.push(
        <Typography color="text.primary" key="current-parent">
            {parentModel === 'Menu' ? 'Children for Menu: ' : 'Children for Submenu: '} "{parentName || 'Loading...'}"
        </Typography>
    );


    return (
        <Box sx={{ mt: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                {breadcrumbLinks}
            </Breadcrumbs>

            <Typography variant="h4" gutterBottom component="h1">
                Manage Children for {parentModel}: "{parentName || 'Loading...'}"
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                disabled={isAddButtonDisabled || loading}
                sx={{ mb: 3 }}
            >
                {isAddButtonDisabled ? `Maximum 5 Children Reached for this ${parentModel}` : 'Add New Child'}
            </Button>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : children.length === 0 ? (
                <Typography variant="body1" color="text.secondary">No children found for this {parentModel}. Add your first child!</Typography>
            ) : (
                <Paper elevation={2}>
                    <List>
                        {children.map((child) => (
                            <ListItem
                                key={child._id}
                                divider
                                secondaryAction={
                                    <>
                                    {/* If templateType is 'submenu', allow drilling down to manage its children */}
                                    {child.templateType === 'submenu' && (
                                        <IconButton
                                        edge="end"
                                        aria-label="manage-children"
                                        component={RouterLink}
                                        to={`/admin/nav/Submenu/${child._id}/children`}
                                        sx={{ mr: 1 }}
                                        >
                                        <AddCircleOutline />
                                        </IconButton>
                                    )}
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(child)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteChild(child._id)}>
                                        <Delete />
                                    </IconButton>
                                    </>
                                }
                                >
                                <ListItemText
                                    primary={child.name}
                                    secondary={
                                    <>
                                        Order: {child.order} | Type: {child.templateType}
                                        {child.templateType !== 'submenu' && child.contentItems && child.contentItems.length > 0 &&
                                        ` | Items: ${child.contentItems.length}`}
                                    </>
                                    }
                                />
                            </ListItem>

                        ))}
                    </List>
                </Paper>
            )}

            {/* Add/Edit Child Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentChild ? 'Edit Child' : 'Add New Child'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Child Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        margin="dense"
                        id="order"
                        label="Order"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={childOrder}
                        onChange={(e) => setChildOrder(Number(e.target.value))}
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
                            helperText="Enter content items as a valid JSON array"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmitChild} variant="contained" color="primary">
                        {currentChild ? 'Update' : 'Add'}
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

export default ChildrenManagementPage;