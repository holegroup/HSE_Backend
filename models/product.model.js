const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    equip_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    actual_equip_id: {
        type: String,
        required: true,
    },
    items:[ 
        { 
            serial_number: {type: String}, 
            name: {type: String}, 
            parts: [ 
                { 
                    part_name: {type: String}, 
                    part_number: {type: String}
                }
            ]
        }
    ]
});

module.exports = mongoose.model("Product", productSchema);
