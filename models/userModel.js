const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        defeault: Date.now
    },
    Boardmembers:[{
        type: String,
        // ref:'User',
    }]
})
const User = mongoose.model('User', userSchema);
module.exports = User;