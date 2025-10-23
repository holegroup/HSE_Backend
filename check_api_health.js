const http = require('http');
const https = require('https');

// Configuration
const endpoints = [
    { name: 'Local API', url: 'http://localhost:5000/api/health' },
    { name: 'Production API', url: 'https://hsebackend.myhsebuddy.com/api/health' }
];

function checkEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = new URL(endpoint.url);
        const client = url.protocol === 'https:' ? https : http;
        
        console.log(`\n🔍 Checking ${endpoint.name}: ${endpoint.url}`);
        console.log('----------------------------------------');
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'GET',
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        };
        
        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`✅ Status Code: ${res.statusCode}`);
                
                try {
                    const json = JSON.parse(data);
                    
                    if (json.success) {
                        console.log('✅ API is healthy');
                        console.log(`📍 Environment: ${json.environment || 'N/A'}`);
                        console.log(`🔌 Port: ${json.port || 'N/A'}`);
                        
                        if (json.database) {
                            console.log('\n📊 Database Status:');
                            console.log(`   - Status: ${json.database.status}`);
                            console.log(`   - Connected: ${json.database.connected ? '✅ Yes' : '❌ No'}`);
                            console.log(`   - URI Configured: ${json.database.uri === 'configured' ? '✅ Yes' : '❌ No'}`);
                        }
                        
                        if (json.server && json.server.uptime) {
                            const uptime = Math.floor(json.server.uptime / 60);
                            console.log(`\n⏱️  Server Uptime: ${uptime} minutes`);
                        }
                    } else {
                        console.log('❌ API health check failed');
                        console.log('Response:', json);
                    }
                } catch (e) {
                    console.log('❌ Failed to parse response');
                    console.log('Raw response:', data);
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Connection failed: ${error.message}`);
            
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 The server is not running or not accessible on this port');
                console.log('   Run: npm start (or npm run dev) to start the server');
            } else if (error.code === 'ETIMEDOUT') {
                console.log('💡 Connection timed out - check network/firewall settings');
            }
            
            resolve();
        });
        
        req.on('timeout', () => {
            console.log('❌ Request timed out');
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

async function runHealthChecks() {
    console.log('========================================');
    console.log('HSE Backend API Health Check');
    console.log('========================================');
    
    for (const endpoint of endpoints) {
        await checkEndpoint(endpoint);
    }
    
    console.log('\n========================================');
    console.log('Health check complete');
    console.log('========================================');
}

// Run the checks
runHealthChecks();
