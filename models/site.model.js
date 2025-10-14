const mongoose = require("mongoose");

const siteSchema = mongoose.Schema({
    site_name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zip_code: { type: String, required: true }
    },
    // storage_capacity: {
    //     type: Number, // Can represent square footage or volume capacity
    //     required: true
    // },
    products_stored: [
        {
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            items: [
                { 
                    serial_number: { type: String }, 
                    parts: [
                        {
                          part_number: { type: String },
                        }
                      ]
                }
            ],
        }
    ]
}, { 
    timestamps: true
});

module.exports = mongoose.model('Site', siteSchema); 