const mongoose = require("mongoose");

const TempPartSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    part_name: {
        type: String,
        required: true
    },
    part_number: {
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
    }
});

module.exports = mongoose.model("TempPart", TempPartSchema);
