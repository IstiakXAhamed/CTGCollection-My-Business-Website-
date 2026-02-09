const crypto = require('crypto');
const fs = require('fs');

const params = 'folder=ctg-collection/products&timestamp=1770610536';
const expected = '28ebf9424bcba776f41ac5479518750c2d9a0c61';
const secrets = [
    'nkumpDfl0OYGAIxFRDgg3CYl4NE',
    'nkumpDfl0OYGAIxFRDgg3CYI4NE',
    'nkumpDfI0OYGAIxFRDgg3CYl4NE',
    'nkumpDfI0OYGAIxFRDgg3CYI4NE',
    'nkumpDfl0OYGAIxFRDgg3CY14NE', // Added 1 instead of l
];

let results = 'Testing Signature: ' + expected + '\n';
results += 'String to sign: ' + params + '\n\n';

secrets.forEach(s => {
    const hash = crypto.createHash('sha1').update(params + s).digest('hex');
    results += s + ' -> ' + hash + (hash === expected ? ' [MATCH!]' : '') + '\n';
});

fs.writeFileSync('sig_output.txt', results);
console.log('Results written to sig_output.txt');
