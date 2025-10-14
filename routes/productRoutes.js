const multer = require("multer"); 
const path = require("path"); 
const express = require("express"); 
const os = require("os"); 
router = express.Router(); 
const {saveFile, createProduct, addItems, fetchAllProducts, searchProducts, getProductById, updateProduct, deleteProduct} = require("../controllers/productController"); 


const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, os.tmpdir()); 
    }, 
    filename: (req, file, cb) => { 
        cb(null, Date.now() + path.extname(file.originalname));  // file is passed here correctly
    }
}); 

const upload = multer({storage: storage});

// File upload routes
router.post("/save-file", upload.single('csvFile'), saveFile); 

// Product CRUD routes
router.post("/create-product", createProduct);
router.post("/add-items", addItems); 
router.get("/fetch-all-products", fetchAllProducts); 
router.get("/fetch-all-items", fetchAllProducts); // Keep both for backward compatibility
router.get("/search-products", searchProducts);
router.get("/get-product/:id", getProductById);
router.put("/update-product/:id", updateProduct);
router.delete("/delete-product/:id", deleteProduct);


module.exports = router; 
