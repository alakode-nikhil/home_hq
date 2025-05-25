export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if req.user exists and has a role
        if (!req.user || !req.user.role) {
            res.status(403); // Forbidden
            throw new Error('User not authenticated or role not found');
        }

        // Check if the user's role is included in the allowed roles array
        if (!roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`Role ${req.user.role} is not authorized to access this resource`);
        }

        next(); // User has the required role, proceed
    };
};
