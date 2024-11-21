import userModel from "../models/userModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.json({ success: true, data: users });
    } catch (error) {

        res.status(500).json({ success: 'Failed to fetch users' });
    }
};

// Update a user
export const toggleUserStatus = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findById(userId);
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ success: true, message: user.isBlocked ? 'User blocked' : 'User unblocked' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle user status' });
    }
}



