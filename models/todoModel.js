const mongoose = require('mongoose');

const todoSchema= new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    priority:{
        type: String,
        required: true,
        // enum:['High','Moderate','Low']
    },
    checklist:[{
        todo:{type: String,required:true},
        checked:{type: Boolean, default:false}
    }],
    assignedto:{
        type: String,
         // required: true
    },
    status:{
        type:String,
        default:"TO-DO"
    },
    createdAt: {
        type: Date,
        default: Date.now 
      },
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    duedate:{
        type:Date,
    }
});

const ToDo = mongoose.model('ToDo', todoSchema);
module.exports = ToDo;