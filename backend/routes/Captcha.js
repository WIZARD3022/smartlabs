import express from "express";

const router = express.Router();

// Generate CAPTCHA
router.get("/", (req, res) => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    req.session.captcha = num1 + num2;

    res.json({
        question: `${num1} + ${num2} = ?`
    });
});

// Verify CAPTCHA
router.post("/verify", (req, res) => {
    const { answer } = req.body;

    if (Number(answer) === req.session.captcha) {

        req.session.captcha = null;

        return res.json({
            success: true,
            message: "Captcha Verified"
        });
    }

    res.status(400).json({
        success: false,
        message: "Wrong Captcha"
    });
});

export default router;