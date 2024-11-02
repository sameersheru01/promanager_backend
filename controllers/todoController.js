
const ToDO = require('../models/todoModel');
const User = require('../models/userModel');
const { todoSchema } = require('../config/zod');
require('dotenv').config();

exports.create = async(req,res)=>{
  const userid = req.user.id;
  try {
    const validatedData = todoSchema.parse(req.body);
    const { title, priority, checklist,assignedto,duedate } = validatedData;
      
      const todolist = new ToDO({title, priority, checklist ,userid,assignedto,duedate});
      
      await todolist.save();
      res.status(200).json({ message: `Data received successfully` });
} catch (error) {
    // console.log(error)
    if (error.errors) {
      const formattedErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
         
          return acc;
      }, {});
      
      console.log(formattedErrors);
      return res.status(400).json({ error: formattedErrors });
  }
    res.status(500).json(error);
    }
};

exports.update = async(req,res)=>{
    const {id: todoId} = req.params;
    const userid = req.user.id;
    const { title, priority,assignedto, checklist,duedate } = req.body;
    
    try {
      const updates={ title, priority,assignedto, checklist,duedate: duedate ? new Date(duedate) : null };
      
      const todoItem = await ToDO.findById(todoId); 

    if (todoItem.userid.toString() !== userid) {
      return res.status(403).json({ message: 'Not authorized to update this ToDo' });
  }
   
      const updatedtodo = await ToDO.findByIdAndUpdate(todoId,updates,{ new: true });
      if (!updatedtodo) return res.status(404).send('User not found.');
      console.log(updatedtodo)
      res.json({"updated" : updatedtodo});
    } catch (error) {
      console.error('Error fetching ToDo:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

exports.todobyId = async(req,res)=>{
    const { id } = req.params;
    try {
      const todoItem = await ToDO.findById(id);
      if (!todoItem) {
          return res.status(404).json({ message: 'ToDo not found' });
      }
      console.log(todoItem)
      res.status(200).json(todoItem);
  } catch (error) {
      console.error('Error fetching ToDo:', error);
      res.status(500).json({ message: 'Server error' });
  }
  };

exports.alldata = async(req,res)=>{
    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select('-_id  -password -__v');
        const userIds = await User.distinct('_id', { Boardmembers: { $in: [user.email] } });
        
        const usertodos = await ToDO.find({userid}).select('-__v');
        const assignedTodos = await ToDO.find({ assignedto: user.email }).select('-__v');
        console.log(assignedTodos)
        const boardedtodos = await ToDO.find({ userid: { $in: userIds } }).select('-__v');
        const allTodos = [...usertodos, ...assignedTodos, ...boardedtodos];
  
        const categorizedTodos = allTodos.reduce((acc, todo) => {
          const status = todo.status; 
          if (!acc[status]) {
              acc[status] = []; 
          }
          acc[status].push(todo); 
          return acc;
      }, {});
        let userdata = {user,todos:[
          {"Backlog": categorizedTodos['BACKLOG'] || [] },
          { "To do": categorizedTodos['TO-DO'] || [] },
          {"in progress": categorizedTodos['PROGRESS'] || []},
          {"done": categorizedTodos['DONE'] || []},
        ]}
    res.json(userdata);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
  };

exports.updatetodostatus = async(req,res)=>{
    const {id} = req.params;
    const {status} = req.body;
    try {
      const updates={status}
      const updatedtodo = await ToDO.findByIdAndUpdate(id,updates,{ new: true });
      if (!updatedtodo) return res.status(404).send('todo not found.');
      res.status(200).json({message: "Done updating status"})
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
};

exports.deletetodo = async(req,res)=>{
    try {
      const { id } = req.params;
  
      const deletedTodo = await ToDO.findByIdAndDelete(id);
  
      if (!deletedTodo) {
          return res.status(404).json({ error: 'Todo not found' });
      }
  
      res.status(200).json({ message: 'Todo successfully deleted' });
  } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'An error occurred while deleting the todo' });
  }
  };

exports.updatetodochecklist = async(req,res)=>{
    const {id} = req.params;
      const {checklist} = req.body;
      console.log(req.body)
      try {
        const updates={checklist}
        const updatedtodo = await ToDO.findByIdAndUpdate(id,updates,{ new: true });
        if (!updatedtodo) return res.status(404).send('todo not found.');
        res.status(200).json({message: "Done updating checklist"})
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
      }
  };

  exports.alltasksCount = async (req, res) => {
    try {
      const userid = req.user.id;
      const user = await User.findById(userid).select('-_id -password -__v');
      const userIds = await User.distinct('_id', { Boardmembers: { $in: [user.email] } });
  
      const usertodos = await ToDO.find({ userid }).select('-__v');
      const assignedTodos = await ToDO.find({ assignedto: user.email }).select('-__v');
      const boardedtodos = await ToDO.find({ userid: { $in: userIds } }).select('-__v');
      
      const allTodos = [...usertodos, ...assignedTodos, ...boardedtodos];
  
      let counts = {
        backlogCount: 0,
        toDoCount: 0,
        inProgressCount: 0,
        doneCount: 0
      };
      let priorityCounts = { high: 0, moderate: 0, low: 0 };
      let dueDateCount = 0;
  
      allTodos.forEach(todo => {
        const status = todo.status;
        const priority = todo.priority || "Uncategorized";
        const hasDueDate = !!todo.duedate;
  
        if (status === 'BACKLOG') counts.backlogCount++;
        else if (status === 'TO-DO') counts.toDoCount++;
        else if (status === 'PROGRESS') counts.inProgressCount++;
        else if (status === 'DONE') counts.doneCount++;
  
        if (priority === 'HIGH PRIORITY') priorityCounts.high++;
        else if (priority === 'MODERATE PRIORITY') priorityCounts.moderate++;
        else if (priority === 'LOW PRIORITY') priorityCounts.low++;
  
        if (hasDueDate) dueDateCount++;
      });
  
      res.json({
        counts,
        totalPriorityCounts: priorityCounts,
        totalDueDateCount: dueDateCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };