import Requirement from '../models/requirement.model.js';

import express from 'express';
const router = express.Router();


router.post('/requirement', async (req, res) => {
  try {
    const newReq = new Requirement(req.body);
    await newReq.save();
    // console.log(newReq)
    // console.log("done")
    res.status(201).json({ message: 'Requirement posted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/requirement', async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    // console.log("coming")
    // console.log(requirements)
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/requirement/:id
router.delete('/requirement/:id', async (req, res) => {
  try {
    const deleted = await Requirement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
