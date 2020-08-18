const mongoose = require('mongoose');
require('dotenv')
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
var Schema = mongoose.Schema

var UserSchema = new Schema({
    roomID: {
        type: String,
        required: true,
      },
    data :{
        type : Number,
    },
    UserID : {
        type : String,
        required : true,
    },
    PublicIP:{
        type : String,
    },
    timeStamp :{
        type: Date, default: (new Date()).getTime() 
    }
   
})
module.exports = mongoose.model("User",UserSchema)


