const Product = require("../models/product.model");
const csvParser = require("csv-parser");
const fs = require("fs");
require("dotenv").config();


async function saveFile(req, res) {
    const result = [];
    const filePath = req.file.path;
    let savedProduct; 

    fs.createReadStream(filePath).pipe(csvParser()).on('data', (data) => {
        result.push(data);
    })
        .on('end', async () => {
            for (let row of result) {
                const newProduct = new Product({
                    equip_name: row.equip_name,
                    description: row.description,   
                    actual_equip_id: row.actual_equip_id,
                }); 

                try{    
                    // savedProduct = await newProduct.save(); 
                    await newProduct.save(); 
                    
                }catch(err){ 
                   console.log("error, saving inspection", err.message);  
                }
            }
            res.status(200).json({message: "Data Saved Successfully"}); 
        })
        .on('error', (error) => { 
            console.log("error in reading CSV file", error); 
            return res.status(500).json({message: error.message}); 
        })
      
}



// Create a new product
async function createProduct(req, res) {
    try {
        const { equip_name, description, actual_equip_id } = req.body;
        
        if (!equip_name || !actual_equip_id) {
            return res.status(400).json({ 
                message: "Equipment name and actual equipment ID are required" 
            });
        }
        
        const newProduct = new Product({
            equip_name,
            description: description || "",
            actual_equip_id,
            items: []
        });
        
        const savedProduct = await newProduct.save();
        
        return res.status(201).json({
            message: "Product created successfully",
            data: savedProduct
        });
    } catch (e) {
        console.error('Create product error:', e);
        return res.status(500).json({ message: e.message });
    }
}

async function addItems (req, res){ 
    const {productId, items} = req.body; 

    try{ 
        const product = await Product.findById(productId); 
        if(!product){ 
            return res.status(404).json({message: "Product Not Found"}); 
        }

        product.items = items; 

        await product.save(); 

        return res.status(200).json({message: "Items Saved Successfully", data: product})
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}

async function fetchAllProducts(__, res){ 
    try{ 
        const result = await Product.find(); 
        if(!result){ 
            return res.status(404).json({message: "No Products Found"}); 
        }

        return res.status(200).json({message: "Saved Items", data: result}); 

    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}


// search functionality 
async function searchProducts(req, res){ 
    try{ 
        const {query} = req.query; 

    

        // const result = await Product.aggregate([
        //     { 
        //         $match: {
        //             $or: [
        //                 { "items.parts.part_name": new RegExp(query, 'i') },
        //                 { "items.serial_number": new RegExp(query, 'i') },
        //                 { "items.parts.part_number": new RegExp(query, 'i') }
        //             ]
        //         }
        //     },
        //     {
        //         $project: {
        //             equip_name: 1,
        //             // "items.serial_number": 1,
        //             // "items.name": 1,
        //             searchItems: {
        //                 $map: {
        //                     input: "$items",
        //                     as: "item",
        //                     in: {
        //                         serial_number: "$$item.serial_number",
        //                         name: "$$item.name", 
        //                         parts: {
        //                             $filter: {
        //                                 input: "$$item.parts",
        //                                 as: "part",
        //                                 cond: { 
        //                                     $or:[
        //                                         {
        //                                             $regexMatch: { input: "$$part.part_name", regex: query, options: 'i' }
        //                                         }, 
        //                                         { 
        //                                             $regexMatch: { input: "$$part.part_number", regex: query, options: 'i' }
        //                                         }, 
        //                                         { 
        //                                             $regexMatch: { input: "$$item.serial_number", regex: query, options: 'i' }
        //                                         }
        //                                     ]
        //                                  }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }, 
        //     {
        //         $project: {
        //             searchItems: {
        //                 $filter: {
        //                     input: "$searchItems",
        //                     as: "searchItem",
        //                     cond: { 
        //                         $or: [ 
        //                             { $gt: [{ $size: "$$searchItem.parts" }, 0] },  //matching the name of the part
        //                             { $eq: ["$$searchItem.serial_number", query] }, // or matching the serial number of the product
        //                             { $eq: ["$$searchItem.parts.part_number", query] } // or matching the partnumber of the part
        //                         ]

        //                     }
        //                 }
        //             }
        //         }
        //     }
        // ]);



        const result = await Product.aggregate([
            { 
                $match: {
                    $or: [
                        { "items.parts.part_name": new RegExp(query, 'i') },
                        { "items.parts.part_number": new RegExp(query, 'i') }
                    ]
                }
            },
            {
                $project: {
                    parts: {
                        $reduce: {
                            input: "$items.parts",
                            initialValue: [],
                            in: { 
                                $concatArrays: [
                                    "$$value",
                                    {
                                        $filter: {
                                            input: "$$this",
                                            as: "part",
                                            cond: { 
                                                $or: [
                                                    { $regexMatch: { input: "$$part.part_name", regex: query, options: 'i' } },
                                                    { $regexMatch: { input: "$$part.part_number", regex: query, options: 'i' } }
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$parts"
            },
            {
                $project: {
                    part_name: "$parts.part_name",
                    part_number: "$parts.part_number",
                    _id: "$parts._id"
                }
            }
        ]);


       if(result.length === 0){ 
        return res.status(404).json({message: "No Items Found"}); 
       }
        return res.status(200).json({ 
            data: result, 
        }); 
    }catch(e){ 
        return res.status(500).json({message: e.message}); 
    }
}




// Get product by ID
async function getProductById(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        return res.status(200).json({
            message: "Product retrieved successfully",
            data: product
        });
    } catch (e) {
        console.error('Get product by ID error:', e);
        return res.status(500).json({ message: e.message });
    }
}

// Update product
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const product = await Product.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        return res.status(200).json({
            message: "Product updated successfully",
            data: product
        });
    } catch (e) {
        console.error('Update product error:', e);
        return res.status(500).json({ message: e.message });
    }
}

// Delete product
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        return res.status(200).json({
            message: "Product deleted successfully",
            data: product
        });
    } catch (e) {
        console.error('Delete product error:', e);
        return res.status(500).json({ message: e.message });
    }
}

module.exports = { 
    saveFile, 
    createProduct,
    addItems, 
    fetchAllProducts, 
    searchProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct 
}

