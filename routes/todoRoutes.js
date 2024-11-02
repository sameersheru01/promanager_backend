const express = require('express');
const ToDO = require('../models/todoModel');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/userModel');
require('dotenv').config();
const todoController = require('../controllers/todoController');

router.post('/create',authMiddleware,todoController.create)


router.patch('/update/:id',authMiddleware,todoController.update)


router.get('/todos/:id',todoController.todobyId);


router.get('/alldata',authMiddleware,todoController.alldata);


router.patch('/todostatus/:id',todoController.updatetodostatus)


router.delete('/todo/delete/:id',todoController.deletetodo);


router.patch('/checklist/:id',todoController.updatetodochecklist)



router.get('/taskCounts', authMiddleware, todoController.alltasksCount)



module.exports=router;