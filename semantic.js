const winkNLP = require('wink-nlp')
const model = require('wink-eng-lite-web-model');

class VocabularyEntry {
    constructor(keyword, type, count, links) {
        this.keyword = keyword;
        this.type = type;
        this.occurenceCount = count;
        this.links = links;
    }
}

class Link {
    constructor(source, target, type) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
}

const prepareText = (text) => {
    const processedText = text
        .replace(/e\.g\./g, 'for example')
        .replace(/i\.e\./g, 'that is')
        .replace(/[^\w\s]/gi, ' ') // replace all non alpha-numeric characters except ' (strip punctuaion)
        .replace((/  |\r\n|\n|\r/gm), ' ') // replace differrent space variants
        .replace(/\s\s+/g, ' ').trim() // replace all multi-spaces with single one
        .toLowerCase();

    return processedText;
}

const buildVocab = (input, useAlternativeNear = false, usePartOf = false) => {
    const allowedPOS = ['ADJ', 'ADV', 'VERB', 'NUM', 'NOUN', 'PROPN'];

    const nlp = winkNLP(model);
    const its = nlp.its;

    const doc = nlp.readDoc(input);
    const tokens = doc.tokens().out(its.normal)
    const tokensPOS = doc.tokens().out(its.pos)
    const classifiedTokens = tokens.map((token, id) => {
        let type = 'notion';

        switch (tokensPOS[id]) {
            case 'NOUN':
            case 'PROPN':
            case 'NUM':
                type = 'object';
                break;
            case 'VERB':
                type = 'action';
                break;
            default:
                break;
        }

        return {
            token,
            type,
            POS: tokensPOS[id],
            count: tokens.filter(t => t == token).length
        }
    })
        .filter((tokenObj) => allowedPOS.includes(tokenObj.POS) && tokenObj.count > 2)
        .reduce((unique, o) => {
            if (!unique.some(obj => obj.token === o.token)) unique.push(o);
            return unique;
        }, []);


    const vocabulary = classifiedTokens.map((token) => {
        let tokenNear = [];

        // Find all tokens near the current token in the input string
        if (useAlternativeNear) {
            tokens.forEach((t, id) => {
                if (t == token.token) {
                    const nearTokens = tokens.slice(id - 2, id + 3)
                    nearTokens.forEach((nearToken) => {
                        if (nearToken != token.token) tokenNear.push(nearToken);
                    });
                }
            });
        } else {
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i] === token.token) {
                    if (i > 0) tokenNear.push(tokens[i - 1]);
                    if (i < tokens.length - 1) tokenNear.push(tokens[i + 1]);
                }
            }
        }

        // Remove duplicates
        tokenNear = tokenNear.filter((v, i, a) => a.indexOf(v) === i);

        // Check if the near token is in the vocabulary
        tokenNear = tokenNear.filter((nearToken) => classifiedTokens.some((v) => v.token == nearToken));

        if (tokenNear.length > 0) {
            const links = tokenNear.map((nearToken) => {
                const nearTokenObj = classifiedTokens.find((v) => v.token == nearToken);
                let type = 'isa';

                if (token.type !== nearTokenObj.type && ['object', 'notion'].includes(token.type) && ['object', 'notion'].includes(nearTokenObj.type)) type = 'kindof';
                if (usePartOf && ['object', 'action'].includes(token.type) && ['object', 'action'].includes(nearTokenObj.type) && (token.type !== 'action' && nearTokenObj.type !== 'action')) type = 'partof';

                return new Link(token.token, nearToken, type);
            });

            return new VocabularyEntry(token.token, token.POS, token.count, links);
        }
    }).filter((t) => !!t);

    return vocabulary;
}

module.exports = {
    prepareText,
    buildVocab
}
