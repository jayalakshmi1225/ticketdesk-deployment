// load_test.js — Milestone M8 Sanity & Load Test with Connection Pooling
const http = require('http');
const https = require('https');

const TARGET_URL = process.env.TARGET_URL || 'http://ticketdesk-alb-167803356.ap-south-2.elb.amazonaws.com';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '20', 10);
const DURATION_SECONDS = parseInt(process.env.DURATION_SECONDS || '300', 10); // 5 minutes default

// Connection pool agent to prevent Windows client-side TCP socket exhaustion
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50, timeout: 5000 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, timeout: 5000 });

let totalRequests = 0;
let successRequests = 0;
let failedRequests = 0;
const startTime = Date.now();

function sendRequest(userId) {
  if ((Date.now() - startTime) / 1000 >= DURATION_SECONDS) return;

  const url = `${TARGET_URL}/api/health`;
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;
  const agent = isHttps ? httpsAgent : httpAgent;

  const req = client.get(url, { agent }, (res) => {
    // Consume response data to free socket
    res.on('data', () => {});
    res.on('end', () => {
      totalRequests++;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        successRequests++;
      } else {
        failedRequests++;
      }
      setTimeout(() => sendRequest(userId), Math.random() * 200 + 100);
    });
  });

  req.on('error', (err) => {
    totalRequests++;
    failedRequests++;
    setTimeout(() => sendRequest(userId), 500);
  });

  req.setTimeout(5000, () => {
    req.destroy();
  });
}

console.log(`================================================================`);
console.log(`🚀 Starting M8 Sanity Load Test (Pooled HTTP Keep-Alive)`);
console.log(` Target URL       : ${TARGET_URL}`);
console.log(` Concurrent Users : ${CONCURRENT_USERS}`);
console.log(` Duration         : ${DURATION_SECONDS} seconds (${(DURATION_SECONDS / 60).toFixed(1)} mins)`);
console.log(`================================================================\n`);

for (let i = 1; i <= CONCURRENT_USERS; i++) {
  sendRequest(i);
}

const interval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const rps = (totalRequests / Math.max(1, elapsed)).toFixed(1);
  const errorRate = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';
  
  process.stdout.write(`\r⏱️  [${elapsed}s/${DURATION_SECONDS}s] Requests: ${totalRequests} | 2xx Success: ${successRequests} | Failed: ${failedRequests} | RPS: ${rps}/s | Error Rate: ${errorRate}%`);

  if (elapsed >= DURATION_SECONDS) {
    clearInterval(interval);
    console.log("\n\n================================================================");
    console.log("🏆 LOAD TEST COMPLETED — FINAL RESULTS");
    console.log("================================================================");
    console.log(` Target URL          : ${TARGET_URL}`);
    console.log(` Total HTTP Requests : ${totalRequests}`);
    console.log(` Successful (2xx/3xx): ${successRequests}`);
    console.log(` Failed (4xx/5xx)    : ${failedRequests}`);
    console.log(` Final Error Rate    : ${errorRate}%`);
    console.log(` Status              : ${failedRequests === 0 ? '✅ PASSED (0% ERROR RATE)' : '❌ FAILED'}`);
    console.log("================================================================\n");
    process.exit(failedRequests === 0 ? 0 : 1);
  }
}, 1000);
