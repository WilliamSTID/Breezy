const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    },
});

const upload = multer({ storage });

// 🚨 Route PRIVÉE appelée par userProfile
router.post("/internal/avatar-upload", upload.single("avatar"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    return res.status(201).json({ avatar: avatarPath });
});

module.exports = router;
