const express = require('express');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.static('public'));


app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.post('/build', (req, res) => {
    console.log('Build request received');
    console.log(req.body);
    res.sendStatus(201);
});
