const express = require('express');
const { prepareText, buildVocab } = require('./semantic');

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
    const input = req.body.input;
    const alternative = req.body.alternative;
    const partof = req.body.partof;

    const processedString = prepareText(input);
    const vocab = buildVocab(processedString, alternative, partof);

    res.status(201).send({ processedString, vocab });
});
