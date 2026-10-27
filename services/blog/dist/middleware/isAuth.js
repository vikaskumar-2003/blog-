import jwt, {} from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({
                message: "Please Login-Noauth header"
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "Invalid authorization token",
            });
            return;
        }
        const decodedValue = jwt.verify(token, process.env.JWT_SECERT_KEY);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "invalid token"
            });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        console.log("jwt verification error", error);
        res.status(401).json({
            message: "please login -jwt error"
        });
    }
};
//# sourceMappingURL=isAuth.js.map