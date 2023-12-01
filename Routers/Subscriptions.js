import express from 'express';
const router = express.Router();
import UserModels from '../Models/UsersModels.js';
import userAuth from '../middlewares/userAuth.js';
import PlansModel from '../Models/PlansModels.js';
import SubscriptionModel from "../Models/SubscriptionsModels.js";
import paypal from 'paypal-rest-sdk';
import dotenv from "dotenv";
dotenv.config();

paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET
});

router.get('/api/subscription/new', userAuth, async (req, res, next) => {
    try {
        const plan = await PlansModel.findOne({name: "Premium"});
        if(!plan){
            return res.status(400).send({error: 'Please select a valid plan to purchase'})
        }
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `${process.env.BACKEND_URL}/payment/success?plan=${plan.name}`,
                "cancel_url": `${process.env.BACKEND_URL}/payment/cancel`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": plan.name,
                        "sku": `${plan.name}-${plan.duration}`,
                        "price": plan.price,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": plan.price
                },
                "description": plan.description
            }]
        };
    
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0; i < payment.links.length; i++){
                    if(payment.links[i].rel === 'approval_url'){
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    } catch(error){
        return res.status(500).send({error: 'Something went wrong, please try again later'})
    }
});

router.get('/payment/success', userAuth, async (req, res, next) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const plan = req.query.plan;

        paypal.payment.get(paymentId, function (error, payment) {
            if (error) {
                throw new Error('Payment Failed')
            } else {
                const transactionAmount = payment.transactions[0].amount.total;

                const execute_payment_json = {
                    "payer_id": payerId,
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": transactionAmount
                        }
                    }]
                };

                paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                            try {
                                const newSubscription = new SubscriptionModel({
                                    userId: req.user._id,
                                    paymentId,
                                    payerId,
                                    amount: transactionAmount,
                                    expiryDate: Date.now() + 2592000000
                                });
        
                                const newSub = await newSubscription.save()
                                const user = await UserModels.findById(req.user._id);
                                user.subscription = plan;
                                user.currentSubscription = newSub._id;
                                await user.save()
                                res.send('Payment Successful');    
                            } catch (error) {
                                throw new Error({ server: 'Server Error. Please contact support.' })
                            }
                    }
                });
            }
        });
    } catch(error){
        res.status(500).send({error: 'Something went wrong, please contact support'})
    }
});

router.get('/payment/cancel', (req, res, next) => res.send('Payment Cancelled'));


router.post('/api/subscription/change', userAuth, async (req, res, next) => {
    try {
        // const userId = req.user._id;
        const userId = req.user._id;
        const user = await UserModels.findById(userId);
        const plan = user.subscription;
        if(plan === "Premium"){
            
        }
        res.status(200).json({message: plan});
    } catch(error){

    }
});

router.post('/api/subscription/cancel', userAuth, async (req, res, next) => {
    try {
    } catch(error){

    }
});


export default router;