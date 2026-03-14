require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // NEW
const { GoogleGenerativeAI } = require('@google/generative-ai');
const commandsData = require('./commandsData.json');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB Connected!");
        seedDatabase(); // Run the seed function once connected
    })
    .catch(err => console.log("❌ MongoDB Error:", err));

// 2. Define the Schema (The Blueprint)
const commandSchema = new mongoose.Schema({
    os: String,
    title: String,
    problem: String,
    command: String,
    tags: String
});

const Command = mongoose.model('Command', commandSchema);

// 3. The Seed Function (Moves JSON to Cloud)
async function seedDatabase() {
    try {
        const count = await Command.countDocuments();
        if (count === 0) {
            console.log("Empty database found. Importing commands from JSON...");
            await Command.insertMany(commandsData);
            console.log("✨ Successfully imported initial commands!");
        }
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. Update the Routes to use MongoDB instead of the JSON file
app.get('/api/commands', async (req, res) => {
    try {
        const commands = await Command.find(); // Fetches from Cloud!
        res.json(commands);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch from DB" });
    }
});

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
        res.status(500).json({ error: "AI Error" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});