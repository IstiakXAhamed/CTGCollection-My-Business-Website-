const crypto = require('crypto');
const fs = require('fs');

const p = 'folder=ctg-collection/products&timestamp=1770611632';
const s1 = 'nkumpDfl0OYGAIxFRDgg3CYl4NE'; // with l
const s2 = 'nkumpDfl0OYGAIxFRDgg3CYI4NE'; // with I

const h1 = crypto.createHash('sha1').update(p + s1).digest('hex');
const h2 = crypto.createHash('sha1').update(p + s2).digest('hex');

const result = `l: ${h1}\nI: ${h2}\n`;
fs.writeFileSync('sig_diag.txt', result);
console.log('Results written to sig_diag.txt');
