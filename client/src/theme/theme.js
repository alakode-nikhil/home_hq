import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // A standard blue
        },
        secondary: {
            main: '#dc004e', // A standard red
        },
        background: {
            default: grey[50], // Very light grey background
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
        },
        // Add more typography variants as needed
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Slightly rounded buttons
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginBottom: '1rem', // Spacing below text fields
                },
            },
        },
        // Add more component overrides here if needed
    },
});

export default theme;