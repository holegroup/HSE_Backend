const express = require("express"); 

router = express.Router(); 

const {createSite, addItemsToSite, addPartsToSite, fetchAllSites, fetchProducts,  tempItemsStatusChange, fetchAllTempItems, fetchAllTempParts, tempPartsStatusChange} = require("../controllers/siteController"); 

router.post("/create-site", createSite); 
router.post("/add-items-site", addItemsToSite); 
router.post("/add-parts-items", addPartsToSite); 
router.get("/fetch-all-sites", fetchAllSites);
router.get("/fetch-products/:id", fetchProducts); 
router.post("/temp-item-status-change", tempItemsStatusChange);
router.get("/fetch-all-temp-items", fetchAllTempItems);
router.get("/fetch-all-temp-parts", fetchAllTempParts);
router.post("/temp-part-status-change", tempPartsStatusChange);

module.exports = router; 