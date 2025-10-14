const InspectionForm = require("../models/inspectionform.model"); 
const Task = require("../models/task.model"); 
require("dotenv").config(); 
const cloudinary = require("cloudinary").v2; 


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




async function createInspectionForm(req, res){ 
    try{ 
        const { equip_name_look, date_manufacture, part_num, serial_num,  equip_desc, location, lat, long, taskId} = req.body;  
        const pictureUrls = [];

        // const samePartNumber = await InspectionForm.findOne({part_num}); 
        // if(samePartNumber) { 
        //     return res.status(400).json({message: "Form with a same partnumber has already been created"});  
        // }

        // const sameSerialNumber = await InspectionForm.findOne({serial_num}); 
        // if(sameSerialNumber) { 
        //     return res.status(400).json({message: "Form with a same serialnumber has already been created"});  
        // }

        // console.log(req.files); 
        
        for(const file of req.files){ 
            const result = await new Promise((resolve, reject) => {
                
                console.log(file)
                cloudinary.uploader.upload_stream(
                    {
                        folder: "inspections", 
                        quality: "auto:good",  
                        fetch_format: "auto",  
                        width: 1024,           
                        crop: "limit"
                    }, 
                    (error, result) => { 
                        if(error) reject(error); 
                        else resolve(result); 
                        // console.log(result)
                    },
                ).end(file.buffer); 
            }); 

            pictureUrls.push(result.secure_url); 
        }

        const newInspection = new InspectionForm({ 
            equip_name_look,
            date_manufacture,
            part_num,
            serial_num,
            // maintenance_freq,
            equip_desc,
            picture: pictureUrls, 
            location, 
            lat, 
            long,
            taskId
        }); 

      

        const saveInspection = await newInspection.save(); 

        // console.log(saveInspection, "This is inpsection form "); 
        if(taskId){ 
            const task = await Task.findById(taskId);  
            task.inspectionForms.push(saveInspection._id);
            task.status = "Completed" ; 
            await task.save(); 
        }
        return res.status(200).json({ 
            message: "Inspection Form Created Successfully", 
            data: saveInspection, 
        })
    }catch(e){ 
        return res.status(500).json({ 
            message: e.message, 
        })
    }
}


async function getAllInspectionForms(req, res) { 
    try{ 
        const inspections = await InspectionForm.find(); 
        if(inspections.length === 0){ 
            return res.status(404).json({ message: "There Are no Inspections Found"}); 
        }
        return res.status(200).json({ 
            message: "Success", 
            data: inspections,
        })
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function getInspectionFormByTaskId(req, res){ 
    try { 
        const {taskId} = req.query; 
  
        if(!taskId) { 
            return res.status(400).json({message: "Task Id is Required"}); 
        }

        const task = await Task.findById(taskId).populate('inspectionForms'); 
        if(!task){ 
            return res.status(404).json({message: "Task Not Found"}); 
        }

        if (!task.inspectionForms || task.inspectionForms.length === 0) {
            return res.status(404).json({ message: 'No inspection forms found for this task' });
        }

        return res.status(200).json({
            message: 'Inspection forms retrieved successfully',
            data: task.inspectionForms,
        });
    }catch(e){ 
        res.status(500).json({ message:e.message });
    }
}


// // Get a single inspection form by part number
// exports.getInspectionFormByPartNum = async (req, res) => {
//     try {
//         const { part_num } = req.params;
//         const inspection = await Inspection.findOne({ part_num });

//         if (!inspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form fetched successfully',
//             data: inspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };

// // Update an inspection form by part number
// exports.updateInspectionForm = async (req, res) => {
//     try {
//         const { part_num } = req.params;
//         const updatedData = req.body;

//         const updatedInspection = await Inspection.findOneAndUpdate(
//             { part_num },
//             { $set: updatedData },
//             { new: true } // Return the updated document
//         );

//         if (!updatedInspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form updated successfully',
//             data: updatedInspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };

// // Delete an inspection form by part number
// exports.deleteInspectionForm = async (req, res) => {
//     try {
//         const { part_num } = req.params;

//         const deletedInspection = await Inspection.findOneAndDelete({ part_num });

//         if (!deletedInspection) {
//             return res.status(404).json({ message: 'Inspection form not found' });
//         }

//         return res.status(200).json({
//             message: 'Inspection form deleted successfully',
//             data: deletedInspection
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//     }
// };



module.exports = {createInspectionForm, getAllInspectionForms, getInspectionFormByTaskId}; 