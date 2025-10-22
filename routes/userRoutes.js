const express = require("express"); 
router = express.Router(); 
const multer = require("multer");
const User = require("../models/user.model");
const {login, register, createUser, searchUser, editProfile, validateSuperAdmin, getAllInspectors, getAllSupervisors, getAllSuperAdmins, getAllUsers} = require("../controllers/userController"); 
const {authMiddleware,superAdminMiddleware} = require("../middlewares/authMiddleware"); 

const storage = multer.memoryStorage(); 
const upload = multer({storage});

// Public routes (no authentication required)
router.post("/login", login);
router.post("/register", register);
router.get("/check-superadmin", async (req, res) => {
    try {
        const superadminCount = await User.countDocuments({ role: 'superadmin' });
        return res.status(200).json({
            success: true,
            superAdminExists: superadminCount > 0,
            message: superadminCount > 0 ? 
                "A Super Admin already exists in the system" : 
                "No Super Admin exists yet"
        });
    } catch (error) {
        console.error('Error checking superadmin:', error);
        return res.status(500).json({
            success: false,
            message: "Error checking superadmin existence",
            error: error.message
        });
    }
});

// Protected routes (authentication required)
router.get("/validate-super-admin", validateSuperAdmin); 
router.post("/create-user",authMiddleware,superAdminMiddleware,createUser);
router.get("/get-all-supervisors",authMiddleware,superAdminMiddleware,getAllSupervisors);
router.get("/get-all-inspectors",authMiddleware,superAdminMiddleware,getAllInspectors);
router.get("/get-all-superadmins",authMiddleware,superAdminMiddleware,getAllSuperAdmins);
router.get("/get-all-users",authMiddleware,superAdminMiddleware,getAllUsers);
router.get("/search-users", searchUser); 
router.post("/edit-user",upload.single("file"), editProfile);



module.exports = router; 
