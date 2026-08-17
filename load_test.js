const http = require('http');
const https = require('https');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:8080';
const CONCURRENT_USERS = 20;
const DURATION_SECONDS = 300; // 5 minutes

let totalRequests = 0;
let successRequests = 0;
let failedRequests = 0;
const startTime = Date.now();

function sendRequest(userId) {
  if ((Date.now() - startTime) / 1000 >= DURATION_SECONDS) return;

  const url = `${TARGET_URL}/api/health`;
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;

  client.get(url, (res) => {
    totalRequests++;
    if (res.statusCode >= 200 && res.statusCode < 400) {
      successRequests++;
    } else {
      failedRequests++;
    }
    // Schedule next request with slight jitter
    setTimeout(() => sendRequest(userId), Math.random() * 500 + 200);
  }).on('error', (err) => {
    totalRequests++;
    failedRequests++;
    setTimeout(() => sendRequest(userId), 500);
  });
}

console.log(`🚀 Starting Load Sanity Test: ${CONCURRENT_USERS} concurrent users for ${DURATION_SECONDS}s against ${TARGET_URL}`);

for (let i = 1; i <= CONCURRENT_USERS; i++) {
  sendRequest(i);
}

const interval = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  console.log(`[${elapsed}s/${DURATION_SECONDS}s] Requests: ${totalRequests} | Success: ${successRequests} | Failed: ${failedRequests}`);
  if (elapsed >= DURATION_SECONDS) {
    clearInterval(interval);
    console.log("\n================ LOAD TEST RESULTS ================");
    console.log(` Total Requests : ${totalRequests}`);
    console.log(` Successful (2xx): ${successRequests}`);
    console.log(` Failed (4xx/5xx): ${failedRequests}`);
    console.log(` Error Rate      : ${((failedRequests / totalRequests) * 100).toFixed(2)}%`);
    console.log("===================================================");
  }
}, 10000);
