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
    console.log("Checking tables...");
    // Note: The Management API doesn't have a direct "list tables with columns" for Postgres. 
    // We usually have to use the SQL API if available, or just check the environment.
    // However, I can try to execute SQL via the Management API if I find the right endpoint,
    // but usually it's better to just try a direct check if the migration was applied.

    // I'll check if I can use the SQL query endpoint if it exists in the management API (it usually doesn't).
    // I'll try to just check the project details first.
    const project = await request('');
    console.log("Project info:", JSON.stringify(project, null, 2));

    // If I can't check schema via management API, I'll try to use the Service Role Key if I can find it,
    // or I'll just re-apply the SQL via a script if the user authorizes me to "fix it".
}

main();
