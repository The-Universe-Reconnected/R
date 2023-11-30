import express from 'express';
const router = express.Router();
import UserModels from '../Models/UsersModels.js';
import userAuth from '../middlewares/userAuth.js';
import PlansModel from '../Models/PlansModels.js';
import paypal from 'paypal-rest-sdk';

paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET
});

router.post('/api/subscription/new', userAuth, async (req, res) => {
    try {
        const plan = await PlansModel.findOne({name: req.body.plan, duration: req.body.duration})
        if(!plan){
            return res.status(400).send({error: 'Please select a valid plan to purchase'})
        }
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `${process.env.BACKEND_URL}/payment/success`,
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

router.get('/payment/success', userAuth, async (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

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

                paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                    if (error) {
                        throw error;
                    } else {
                        req.user.subscription = plan.name;
                        req.user.duration = plan.duration;
                        req.user.save().then(() => {
                            const newSubscription = new SubscriptionModel({
                                user: req.user._id,
                                paymentId,
                                payerId,
                            });
                            newSubscription.save().then(() => {
                                res.send('Payment Successful');
                            }).catch((error) => {
                                throw new Error({ server: 'Server Error. Please contact support.' })
                            });
                        }).catch((error) => {
                            throw new Error({ server: 'Server Error. Please contact support.' })
                        });
                    }
                });
            }
        });
    } catch(error){
        res.status(500).send({error: 'Something went wrong, please contact support'})
    }
});

router.get('/payment/cancel', (req, res) => res.send('Payment Cancelled'));


router.post('/api/subscription/change', userAuth, async (req, res) => {
    try {

    } catch(error){

    }
});

router.post('/api/subscription/cancel', userAuth, async (req, res) => {
    try {
        
    } catch(error){

    }
});