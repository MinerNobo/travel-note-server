const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://hh.zvluz.cn/api';
const TEST_ENDPOINT = '/notes/approved';

async function testThrottling() {
  const logFile = path.join(__dirname, 'throttle-test-log.txt');
  const writeStream = fs.createWriteStream(logFile, { flags: 'a' });

  const startTime = Date.now();
  writeStream.write(
    `\n--- 测试开始：${new Date().toLocaleString()} ---\n`
  );

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const TOTAL_REQUESTS = 1000;
  const CONCURRENCY = 10;
  const DELAY = 50;

  const requests = [];
  const results = {
    success: 0,
    throttled: 0,
    error: 0,
  };

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const request = axiosInstance
      .get(TEST_ENDPOINT)
      .then(response => {
        results.success++;
        writeStream.write(`请求 ${i + 1}: 成功\n`);
      })
      .catch(error => {
        if (error.response && error.response.status === 429) {
          results.throttled++;
          writeStream.write(
            `请求 ${i + 1}: 被限流 - ${error.response.data.message}\n`
          );
        } else {
          results.error++;
          writeStream.write(
            `请求 ${i + 1}: 错误 - ${error.message}\n`
          );
        }
      });

    requests.push(request);

    if (requests.length >= CONCURRENCY || i === TOTAL_REQUESTS - 1) {
      await Promise.all(requests);
      await new Promise(resolve => setTimeout(resolve, DELAY));
      requests.length = 0;
    }
  }

  const endTime = Date.now();
  writeStream.write(`\n--- 测试结果 ---
总请求数：${TOTAL_REQUESTS}
成功请求：${results.success}
限流请求：${results.throttled}
错误请求：${results.error}
总耗时：${(endTime - startTime) / 1000}秒\n`);

  writeStream.end();
  console.log('测试完成，详细日志已保存到 throttle-test-log.txt');
}

testThrottling().catch(console.error);
