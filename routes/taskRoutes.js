const express = require("express"); 

router = express.Router(); 

const {createTask, getTasks, changeStatus, assignedTask, deleteById, getStatusInspector, getStatusSupervisor, getTaskById, getTaskDateStatus, fetchAllRecuringTasks, changeRecurringStatusById, getAllTasks, getAllTasksCsv} = require("../controllers/taskController"); 

const {authMiddleware} = require('../middlewares/authMiddleware');

router.post("/create-task", createTask); 
router.get("/get-all-tasks", getAllTasks);
router.get("/get-task", getTasks);
router.get("/get-task-date-status", getTaskDateStatus); 
router.get("/get-task-supervisor", assignedTask); 
router.post("/change-status", changeStatus);
router.delete("/delete-task", deleteById);
router.get("/get-task-status-supervisor", getStatusSupervisor); 
router.get("/get-task-status-inspector", getStatusInspector); 
router.get("/get-task-by-id", getTaskById);
router.get("/get-all-recurring-task", fetchAllRecuringTasks);
router.post("/change-recurring-status", changeRecurringStatusById);
router.get("/download-csv", getAllTasksCsv); 


module.exports = router; 

