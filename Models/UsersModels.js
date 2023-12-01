import mongoose from 'mongoose';
import validator from "email-validator";
import bcrypt from 'bcrypt';

const UsersSchema = new mongoose.Schema({
    _id :{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    fullName: {
        type: String, 
        required: true,
        min: [3, 'Name must be 3 characters long!']
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(value.length <= 5) throw new Error('Password must be atleast 6 characters long')
        }
    },
    email: {
        type: String,
        required: true,
        validate(value){
            if(!validator.validate(value)) throw new Error('Email Address is invalid')
        },
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    subscription: {
        type: String,
        default: 'Free'
    },
    tokens:{
        type: Array,
        required: true
    },
    currentSubscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: false
    }
})

UsersSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

const UsersModel = mongoose.model('Users', UsersSchema);

export default UsersModel;