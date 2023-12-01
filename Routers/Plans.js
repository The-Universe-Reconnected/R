import express from 'express';
const router = express.Router();
import PlansModel from '../Models/PlansModels.js';
import userAuth from '../middlewares/userAuth.js';

router.post('/api/plans/new', userAuth, async (req, res, next) => {
    try {
        if(req.user.isAdmin === false){
            return res.status(401).send({error: 'You are unauthorized to perform this action'})
        }
        const newPlan = new PlansModel(req.body);
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/api/plans/:id', userAuth, async (req, res, next) => {
    try {
        if(req.user.isAdmin === false){
            return res.status(401).send({error: 'You are unauthorized to perform this action'})
        }
        const plan = await PlansModel.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.status(200).json({ message: 'Plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/api/plans/:id', userAuth, async (req, res, next) => {
    if(req.user.isAdmin === false){
        return res.status(401).send({error: 'You are unauthorized to perform this action'})
    }
    const updates = req.body;
    const updateKeys = Object.keys(updates);

    const allowedUpdates = ['name', 'description', 'price', 'duration'];
    const isValidOperation = updateKeys.every((key) => allowedUpdates.includes(key));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates!' });
    }

    try {
        const plan = await PlansModel.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        updateKeys.forEach((key) => plan[key] = updates[key]);
        await plan.save();

        res.status(200).json({message: 'Plan updated successfully'});

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/api/plans/all', async (req, res, next) => {
    try {
      const plans = await PlansModel.find({});
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});


router.get('/api/plans/:id', async (req, res, next) => {
    try {
      const plan = await PlansModel.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      res.status(200).json(plan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
 

export default router;