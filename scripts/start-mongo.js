const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const mongod = path.join(
    process.env.LOCALAPPDATA || '',
    'mongodb-7.0.28',
    'mongodb-win32-x86_64-windows-7.0.28',
    'bin',
    'mongod.exe'
);
const dbPath = path.join(__dirname, '..', 'data', 'db');
const logPath = path.join(__dirname, '..', 'data', 'log', 'mongod.log');

if (!fs.existsSync(mongod)) {
    console.error('MongoDB 7.0 binary not found at:', mongod);
    console.error('Install MongoDB 7 locally (Windows 10 is not compatible with MongoDB 8).');
    process.exit(1);
}

fs.mkdirSync(dbPath, { recursive: true });
fs.mkdirSync(path.dirname(logPath), { recursive: true });

const child = spawn(mongod, [
    '--dbpath', dbPath,
    '--logpath', logPath,
    '--bind_ip', '127.0.0.1',
    '--port', '27017',
], { stdio: 'inherit' });

child.on('exit', (code) => process.exit(code || 0));
