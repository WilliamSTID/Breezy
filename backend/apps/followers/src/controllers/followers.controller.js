const Follower = require('../models/Follower');

// const User = require('../models/User');

module.exports = {

    followUser : async (req, res) => {
        console.log(req.body);
        const { userId, followerId } = req.body;
        console.log(userId);
        console.log(followerId);
        if (userId === followerId) {
            return res.status(400).json({ message: "Impossible de se suivre soi-même." });
        }

        try {
            const already = await Follower.findOne({ user: userId, follower: followerId });
            if (already) {
                return res.status(400).json({ message: "Déjà suivi." });
            }

            const follow = new Follower({ user: userId, follower: followerId });
            await follow.save();

            res.json({ message: "Suivi avec succès." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erreur serveur." });
        }
    },

    getFollowers : async (req, res) => {
    try {
        const followers = await Follower.find({ user: req.params.userId }).populate('follower', 'username avatar');
        res.json(followers.map(f => f.follower));
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
    },

    getFollowing : async (req, res) => {
    try {
        const following = await Follower.find({ follower: req.params.followerId }).populate('user', 'username avatar');
        res.json(following.map(f => f.user));
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur." });
    }
    }
}; 
