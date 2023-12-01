import UsersModels from '../Models/UsersModels.js';
import mongoose from 'mongoose';
import express from 'express';
import tokenCreator from '../utils/tokenCreator.js';
import bcrypt from 'bcrypt';
import userAuth from '../middlewares/userAuth.js';

const router = new express.Router();

router.post('/api/users/new', async (req, res, next) => {
    try {
        const account = await UsersModels.findOne({email: req.body.email})
        if(account) {
            return res.status(400).send({error: 'Account with this email already exists'})
        }
        if(req.body.subscription){
            delete req.body.subscription;
        }
        if(req.body.duration){
            delete req.body.duration;
        }
        const _id = new mongoose.Types.ObjectId();
        const tokens = tokenCreator(_id)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const token = tokens[tokens.length - 1]
        res.cookie('token', token, {
            httpOnly: true,
            expires: expirationDate,
            sameSite: 'Lax'
        })
        const isAdmin = req.body.adminPass === process.env.ADMIN_PASS ? true : false;
        await UsersModels({...req.body, tokens, _id, isAdmin}).save();
        res.status(201).send({result: 'User Created Successfully!', token: tokens[0]})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

router.post('/api/users/login', async (req, res, next) => {
    try {
        const user = await UsersModels.findOne({email: req.body.email})
        if(!user){
            return res.status(404).send({emailError: 'User with this email does not exist'})
        }
        const isPasswordValid = bcrypt.compare(req.body.password, user.password)
        if(!isPasswordValid){
            return res.status(400).send({passwordError: 'Password is incorrect!'})
        }
        user.tokens = tokenCreator(user._id, user.tokens)
        await user.save()
        const token = user.tokens[user.tokens.length - 1]
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        res.cookie('token', token, {
            httpOnly: true,
            expires: expirationDate,
            sameSite: 'Lax'
        })
        return res.status(200).send({result: 'Login Successful!'})
    } catch (error){
        return res.status(500).send({error: 'Server Error'})
    }
})

router.patch('/api/users/update', userAuth, async (req, res, next) => {
    try{
        const allowedUpdates = ['fullName', 'password', 'confirmPassword', 'email']
        const updates = Object.keys(req.body)
        const isValidUpdate = updates.every((update) =>
            allowedUpdates.includes(update)
        )
        if(!isValidUpdate){
            return res.status(400).send({error: 'Invalid updates!'})
        }
        updates.forEach(update => (req.user[update] && req.body[update]) ? req.user[update] = req.body[update] : null)
        await req.user.save()
        return res.status(200).send('User Info is updated successfully!')
    } catch(error){
        console.log(error)
        return res.status(500).send(error)
    }
})

router.delete('/api/users/delete', userAuth, async (req, res, next) => {
    try {
        await UsersModels.findByIdAndDelete(req.userId)
        res.clearCookie('token');
        return res.status(200).send('Your account is deleted successfully!')
    } catch (error) {
        return res.status(500).send({error: 'Server Error'})
    }
})

router.get('/api/users/data', userAuth, async (req, res, next) => {
    try{
        const user = req.user.toObject();
        delete user._id;
        delete user.tokens;
        delete user.password;
        return res.status(200).send(user)
    } catch (error) {
        console.log(error)
        res.status(500).send({error: 'Server Error'})
    }
})

router.get('/api/users/logout', userAuth, async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const newTokens = req.user.tokens.map(value => value !== token)
        req.user.tokens = [...newTokens]
        await req.user.save();
        res.clearCookie('token');
        return res.status(200).send('You are logged out successfully!')
    } catch (error){
        return res.status(500).send({error: 'Server Error'})
    }
})


export default router;
