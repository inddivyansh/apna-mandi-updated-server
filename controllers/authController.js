import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: profilePicture } = payload;
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.create({
                googleId, email, name, profilePicture, role: 'Pending',
            });
        }
        res.status(200).json({ user, token: generateToken(user._id) });
    } catch (error) {
        res.status(401).json({ message: 'Invalid Google token.' });
    }
};

export const completeOnboarding = async (req, res) => {
    const { role, businessName, gstNumber, businessCategory, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (user && user.role === 'Pending') {
        user.role = role;
        user.businessName = businessName;
        user.gstNumber = gstNumber;
        user.businessCategory = businessCategory;
        user.phone = phone;
        user.address = address;
        const updatedUser = await user.save();
        res.json({ user: updatedUser, token: generateToken(updatedUser._id) });
    } else {
        res.status(400).json({ message: 'User not found or already onboarded.' });
    }
};

export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.name = req.body.name || user.name;
        user.businessName = req.body.businessName || user.businessName;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.isAvailable = req.body.isAvailable?? user.isAvailable;
        user.operatingPincodes = req.body.operatingPincodes || user.operatingPincodes;
        const updatedUser = await user.save();
        res.json({ user: updatedUser, token: generateToken(updatedUser._id) });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const deleteAccount = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User account deleted.' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};