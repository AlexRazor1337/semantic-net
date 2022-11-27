const winkNLP = require('wink-nlp')
const model = require( 'wink-eng-lite-web-model' );

const prepareText = (text) => {
    const processedText = text.replace(/\W/g, ' ') // replace all non alpha-numeric characters(strip punctuaion)
    .replace(/\s\s+/g, ' ').trim() // replace all multi-spaces with single one
    .toLowerCase();

    return processedText;
}

const buildVocab = (input) => {
    const allowedPOS = ['ADJ', 'ADV', 'NOUN', 'PROPN', 'VERB', 'NUM'];

    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    const doc = nlp.readDoc(processedString);
    const tokens = doc.tokens().out()
    const tokensPOS = doc.tokens().out(its.pos)
    const classifiedTokens = tokens.map((token, id) => {
        return {
            token,
            POS: tokensPOS[id],
            count: tokens.filter(t => t == token).length
        }
    })
    .filter((tokenObj) => allowedPOS.includes(tokenObj.POS) && tokenObj.count > 2)
    .reduce((unique, o) => {
        if(!unique.some(obj => obj.token === o.token))  unique.push(o);

        return unique;
    }, []);


    const vocabulary = classifiedTokens.map((token) => {
        let tokenNear = []

        // Find all tokens near the current token
        tokens.forEach((t, id) => {
            if (t == token.token) {
                const nearTokens = tokens.slice(id - 2, id + 3)
                nearTokens.forEach((nearToken) => {
                    if (nearToken != token.token) tokenNear.push(nearToken)
                })
            }
        })

        // Remove duplicates
        tokenNear = tokenNear.filter((v, i, a) => a.indexOf(v) === i)

        // Check if the near token is in the vocabulary
        tokenNear = tokenNear.filter((nearToken) => classifiedTokens.some((v) => v.token == nearToken))

        if (tokenNear.length > 0) {
            return {
                ...token,
                linksWithOthers: tokenNear
            }
        }
    })

    return vocabulary;
}

module.exports = {
    prepareText,
    buildVocab
}
