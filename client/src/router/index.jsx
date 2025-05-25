import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'; // Import Navigate
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
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
            // Other protected routes will go here
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