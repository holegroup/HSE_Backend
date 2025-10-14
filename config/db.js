const mongoose = require("mongoose"); 
require("dotenv").config(); 

async function connectDb(){ 
    try{ 
        await mongoose.connect(process.env.MONGO_URI); 
        console.log("Connected to db"); 
    }catch(e){ 
        console.log(e.message); 
        process.exit(1); 
    }
}

module.exports = connectDb; 