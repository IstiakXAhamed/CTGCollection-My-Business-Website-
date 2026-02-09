const crypto = require('crypto');
const fs = require('fs');
const params = 'folder=ctg-collection/products&timestamp=1770611632';
const expectedHash = '684f55608e1062b72f4c501651d448c91301f826';

const secrets = [
    'nkumpDfl0OYGAIxFRDgg3CYl4NE', // ends with l4NE
    'nkumpDfl0OYGAIxFRDgg3CYI4NE', // ends with I4NE
    'nkumpDfl0OYGAIxFRDgg3CY14NE', // ends with 14NE
];

let output = '--- Cloudinary Signature Verification ---\n';
output += `Params to sign: ${params}\n`;
output += `Hash from screenshot: ${expectedHash}\n`;
output += '-----------------------------------------\n';

secrets.forEach(s => {
    const hash = crypto.createHash('sha1').update(params + s).digest('hex');
    output += `Testing Secret: ${s}\n`;
    output += `Calculated Hash: ${hash}\n`;
    if (hash === expectedHash) {
        output += '>>> MATCH FOUND! This secret is correct for the screenshot hash. <<<\n';
    } else {
        output += 'NO MATCH.\n';
    }
    output += '-----------------------------------------\n';
});

fs.writeFileSync('debug_output.txt', output);
console.log('Results written to debug_output.txt');
