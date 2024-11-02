const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
require('dotenv').config();

router.post('/register',userController.register)


router.post('/login',userController.login)

router.get('/users',authMiddleware,userController.users)



router.patch('/update',authMiddleware,userController.update)

router.post('/addtoboard', authMiddleware,userController.addtoboard)


module.exports=router;