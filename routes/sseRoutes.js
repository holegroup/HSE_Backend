const express = require('express'); 
const router = express.Router(); 
const {eventsHandler, sendEvent} = require('../controllers/sseController'); 

router.get('/message', eventsHandler); 
router.post('/send', sendEvent); 

module.exports = router; 

