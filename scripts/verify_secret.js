const crypto = require('crypto');
const params = 'folder=ctg-collection/products&timestamp=1770610536';
const expected = '28ebf9424bcba776f41ac5479518750c2d9a0c61';

const secrets = [
  'nkumpDfl0OYGAIxFRDgg3CYl4NE', // what I saw in .env (l)
  'nkumpDfl0OYGAIxFRDgg3CYI4NE', // what user showed in screenshot (I?)
  'nkumpDfl0OYGAIxFRDgg3CY14NE', // common typo (1)
];

console.log('--- Cloudinary Signature Test ---');
console.log('Params:', params);
console.log('Expected:', expected);
console.log('---------------------------------');

secrets.forEach(s => {
  const hash = crypto.createHash('sha1').update(params + s).digest('hex');
  console.log(`Secret: ${s}`);
  console.log(`Hash:   ${hash}`);
  if (hash === expected) {
    console.log('>>> MATCH FOUND! <<<');
  }
  console.log('---------------------------------');
});
