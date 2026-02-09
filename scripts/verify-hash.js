const crypto = require('crypto');
const secret = 'nkumpDfl0OYGAIxFRDgg3CYl4NE';
const str = 'folder=ctg-collection/products&timestamp=1770610536';
const expected = '28ebf9424bcba776f41ac5479518750c2d9a0c61';
const actual = crypto.createHash('sha1').update(str + secret).digest('hex');

console.log('Parameters:', str);
console.log('Secret:', secret);
console.log('Expected Signature:', expected);
console.log('Actual Signature:  ', actual);

if (expected === actual) {
    console.log('MATCH! The secret in .env is correct for this signature.');
} else {
    console.log('MISMATCH! The secret in .env is NOT correct for this signature.');
}
