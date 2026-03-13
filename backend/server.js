require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const commandsData = require('./commandsData.json');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route 1: The standard database
app.get('/api/commands', (req, res) => {
    res.json(commandsData);
});

// Route 2: The NEW AI Route (This is what was missing!)
app.post('/api/ask', async (req, res) => {
    try {
        const { userProblem } = req.body;

        const prompt = `You are a developer cheat-sheet tool. A user is trying to solve this problem: "${userProblem}". 
    Provide the exact terminal command or setting needed to solve it. Keep the explanation to one short sentence.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);

        res.json({
            title: "AI Generated Solution",
            command: result.response.text()
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate answer" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});