import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'; // Import Navigate
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import DashboardPage from '../pages/DashboardPage';
import MenuManagementPage from '../pages/MenuManagementPage';
import HomePage from '../pages/HomePage';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Private route wrapper
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Loading authentication...</div>;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated but not an admin, redirect to dashboard or home
    if (user && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />; // Or to a 403 Forbidden page
    }

    // If authenticated and is admin, render children
    return children;
};
// END NEW ADMIN ROUTE

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: '/dashboard',
                element: (
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                ),
            },
            {
                path: '/admin', // Main admin route
                element: (
                    <AdminRoute>
                        <AdminDashboardPage /> {/* This is our new admin page */}
                    </AdminRoute>
                ),
            },
             {
                path: '/admin/menus', // NEW ROUTE for Menu Management
                element: (
                    <AdminRoute>
                        <MenuManagementPage />
                    </AdminRoute>
                ),
            },
            // ... other protected routes will go here
            // We will add '/admin/menus' and '/admin/submenus' later,
            // they will also be wrapped by AdminRoute

        ],
    },
    {
        path: '/',
        element: <AuthLayout />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },
    {
        path: '*',
        element: <div>404 Not Found</div>,
    },
]);

export default router;