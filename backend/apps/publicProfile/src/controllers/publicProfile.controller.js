const User = require('../models/User');

module.exports = {

    getUserAccountInformation: async (req, res) => {
        try {
            const user = await User.findOne(
                {username: req.params.username},
                'username bio avatar createdAt updatedAt'
            );
            if (!user) return res.status(404).json({message: 'User not found'});
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({message: 'Server error'});
        }
    },
}; 
