import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
// ---- Protect: verify JWT ----
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Access denied. Please login.",
        });
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
// ---- Role guard factory ----
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authenticated." });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden. Required: ${roles.join(" or ")}. You are: ${req.user.role}`,
            });
            return;
        }
        next();
    };
};
// ---- Shorthand guards ----
export const studentOnly = requireRole("student");
export const supervisorOnly = requireRole("supervisor");
export const adminOnly = requireRole("admin");
export const supervisorOrAdmin = requireRole("supervisor", "admin");
