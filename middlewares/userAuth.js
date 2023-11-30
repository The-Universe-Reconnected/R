import jwt from 'jsonwebtoken';
import UsersModels from '../Models/UsersModels.js';
import mongoose from 'mongoose';

const userAuth = async (req, res, next) => {
    try{ 
        console.log(req.cookies)
        const token = req.cookies.token;
        const {_id} = jwt.verify(token, process.env.JWT_SECRET)
        if(!mongoose.isValidObjectId(_id)){
            return res.status(401).send({error: 'You are unauthorized to perform this action'})
        }
        req.userId = _id;
        req.user = await UsersModels.findById(_id);
        if(!req.user){
            return res.status(401).send({error: 'You are unauthorized to perform this action'})
        }
        const {tokens} = req.user;
        let success = 'failure';
        tokens.forEach((value) => {
            if(value === token){
                success = 'success'
            }
        })
        if(success === 'failure'){
            throw new Error()
        }
        return next()
    } catch (error) {
        console.log(error)
        return res.status(401).send({error: 'You are unauthorized to perform this action'})
    }
}

export default userAuth;