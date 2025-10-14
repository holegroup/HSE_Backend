const express = require("express"); 
router = express.Router(); 
const multer = require("multer"); 
const {createInspectionForm, getAllInspectionForms, getInspectionFormByTaskId} = require("../controllers/inspectionFromController"); 

// configure multer 
const storage = multer.memoryStorage(); 
const upload = multer({storage}); 

router.post("/submit-inspection-form",upload.array('files'), createInspectionForm); 
router.get("/get-all-inspections", getAllInspectionForms); 
router.get("/get-inspection-by-task", getInspectionFormByTaskId); 

module.exports = router; 