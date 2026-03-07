const https = require('https');

const token = 'sbp_c3ac5addb5a9b4075ea456b5ac29649d4c9c67f0';
const projectRef = 'wwoonujniqdgtuzmabkz';

function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.supabase.com',
            port: 443,
            path: `/v1/projects/${projectRef}${path}`,
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log("Getting API Keys...");
    const keys = await request('/api-keys');
    console.log(JSON.stringify(keys, null, 2));
}

main();
