const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ 
        name: "Task API",
        version: "1.0",
        endpoint: "/tasks"
    });
});

app.get('/health', (req, res)=>{
    res.json({
        status: "OK",
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});