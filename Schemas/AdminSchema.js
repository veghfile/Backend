const mongoose = require('mongoose');
require('dotenv')
mongoose.connect(process.env.MONGO_URL||"mongodb://localhost:27017/myproject", {useNewUrlParser: true, useUnifiedTopology: true});
var Schema = mongoose.Schema
var AdminSchema = new Schema({
    UserID : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    }
})
module.exports = mongoose.model("Admin",AdminSchema)