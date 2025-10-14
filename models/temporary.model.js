const mongoose = require("mongoose");


const TempItemSchema = new mongoose.Schema({
    siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    serial_number: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
});

module.exports = mongoose.model("TempItem", TempItemSchema);