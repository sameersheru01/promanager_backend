const express = require('express');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerSchema, loginSchema} = require('../config/zod');
require('dotenv').config();

exports.register = async(req,res)=>{
    try {
        const validatedData = registerSchema.parse(req.body);
        const {name,email,password}=validatedData;
        let user = await User.findOne({ email });
        if (user) {
        return res.status(400).json({ error: {email: 'User already exists'} });
        }
        let salt =await bcrypt.genSalt(10);
        let hashedpassword = await bcrypt.hash(password,salt);
        // password = hashedpassword;
        console.log(hashedpassword)
        user = new User({ name, email, password:hashedpassword });
        await user.save();
        const token = jwt.sign({user: { id: user._id,email: user.email }}, process.env.KEY, { expiresIn: '7d' });
        res.status(201).json({token});
    } catch (error) {
        if (error.errors) {
            const formattedErrors = error.errors.reduce((acc, err) => {
                acc[err.path[0]] = err.message;
                
                return acc;
            }, {});
            
            console.log(error.errors);
            return res.status(400).json({ error: formattedErrors });
        }
        res.status(500).send('Server error');
    }
}
exports.login = async(req,res)=>{
    try {
        const validatedData = loginSchema.parse(req.body);
        // console.log(validatedData)
        const {email,password}=validatedData;
        let user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ error: {email: 'User not exists'} });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: {password: 'Invalid Password'} });
        }
        const token = jwt.sign({user: { id: user._id,email: user.email }}, process.env.KEY, { expiresIn: '7d' });
        
        res.status(200).json({token});
    } catch (error) {
        if (error.errors) {
            const formattedErrors = error.errors.reduce((acc, err) => {
                acc[err.path[0]] = err.message;
                
                return acc;
            }, {});
            console.log(error.errors);
            return res.status(400).json({ error: formattedErrors });
        }  
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

exports.users = async(req,res)=>{
    try {
        let users = await User.find({}).select('-name -_id -password -__v');
        console.log(users);
    res.json(users);
    } catch (error) {
        console.log(error);
        res.json(error)
    }
};

exports.update = async(req,res)=>{
    const userid = req.user.id;
    const { name, email, oldpassword , newpassword} = req.body;
    const toupadtefiled = [email, name, oldpassword || newpassword].filter(Boolean);
    if (toupadtefiled.length > 1) {
        return res.status(400).send({ error: {server: 'Please update only one field at a time.'} });
    }else if(toupadtefiled.length == 0){
          return res.status(400).send({ error: {server: 'Please enter any one field at a time.'} });
      }
    try {
        const updates={};
        let statusCode = 200;
        
        if(email){
            const isemailexist = await User.findOne({email});
            if(isemailexist){
                return res.status(400).send({ error: {email: 'Email Already Exists.'} });}
            updates.email=email;    
        }
        else if(name){updates.name=name;}
        else if(oldpassword || newpassword){
            if (!oldpassword || !newpassword) {
                return res.status(400).send({ error: { server: 'Both old and new passwords are required.' } });
            }
            if(newpassword.length < 6){
                return res.status(400).send({ error: { newpassword: 'Password must be atleast 6 letters' } });

            }
            const user = await User.findById(userid);
            const isMatch = await bcrypt.compare(oldpassword, user.password);
            if (!isMatch){
                return res.status(400).send({ error: {oldpassword: 'Old password is incorrect.'} });};
            let salt = await bcrypt.genSalt(10);    
           let newhashpassword=await bcrypt.hash(newpassword,salt);
            updates.password=newhashpassword; 
            statusCode = 201;   
        }
        const updateduser = await User.findByIdAndUpdate(userid,updates,{ new: true });
        if (!updateduser) return res.status(404).send({ error: {server: 'User not found.'} });
        console.log(toupadtefiled)
        res.status(statusCode).json({ message: 'User settings updated successfully', updateduser });
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};

exports.addtoboard = async (req, res) => {
    const {emailId} = req.body;
    const userid = req.user.id;
    console.log(req.body)
    try {
      const user = await User.findByIdAndUpdate(userid,{ $addToSet: { Boardmembers: emailId } }, { new: true }  );
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Board member added successfully', user });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Server error' });
    }
  };