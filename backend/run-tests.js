#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting Authentication Test Suite...\n');

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 1337,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

const runTests = async () => {
  try {
    // Check if server is running
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
      console.log('⚠️  Warning: Backend server does not appear to be running on port', process.env.PORT || 1337);
      console.log('   Please start the server with: npm start\n');
    }

    // Run Jest tests
    const jest = spawn('npx', ['jest', '--verbose'], {
      stdio: 'inherit',
      shell: true
    });

    jest.on('close', (code) => {
      console.log(`\n${code === 0 ? '✅' : '❌'} Tests completed with exit code: ${code}`);
      
      if (code === 0) {
        console.log('\n🎉 All tests passed!');
      } else {
        console.log('\n💡 Some tests failed. Check the output above for details.');
      }
    });

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test run interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test run terminated');
  process.exit(0);
});

runTests(); 