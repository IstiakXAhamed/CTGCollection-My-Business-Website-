const http = require('http');

const data = JSON.stringify({
    storeName: 'Silk Mart Test',
    chatStatus: 'online',
    adminProductMode: 'simple',
    shippingCost: 60,
    freeShippingMin: 2000,
    promoEndTime: null
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/settings',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
