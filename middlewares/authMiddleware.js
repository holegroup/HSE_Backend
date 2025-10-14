const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function authMiddleware(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            // decoding the token
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.user.id).select("-password");
            next();
        } catch (e) {
            res.status(401).json({
                message: e.message
            })
        }

    }

    if (!token) {
        res.status(401).json({
            message: "Not Authorised, no token found"
        })
    }

}


function superAdminMiddleware(req, res, next){ 
    if(req.user.role && req.user.role !== "superadmin"){ 
        return res.status(403).json({ 
             message: 'Access restricted to super admin only'
        }); 
    }
    next(); 
}

module.exports = {superAdminMiddleware}; 

module.exports = {authMiddleware, superAdminMiddleware}; 