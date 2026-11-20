/**
 * Offline CLI Encryption Tool for Secret Navigation Bookmarks
 * Usage: node encrypt_tool.js [password] [json_file_path]
 */

const crypto = require('crypto');
const fs = require('fs');

const password = process.argv[2] || 'nav778080';
const inputPath = process.argv[3];

let items = [
  {
    title: "私有云盘 / NAS 控制台",
    url: "https://nas.example.com",
    description: "家庭高可用私有存储与多媒体流媒体中心",
    icon: ""
  },
  {
    title: "内网穿透与反向代理",
    url: "https://proxy.example.com",
    description: "安全网络隧道穿透与节点网关面板",
    icon: ""
  }
];

if (inputPath && fs.existsSync(inputPath)) {
  items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
}

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const plaintext = JSON.stringify(items);
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const webCryptoCiphertext = Buffer.concat([encrypted, tag]);

const output = {
  algorithm: "AES-256-GCM",
  kdf: "PBKDF2-SHA256",
  iterations: 100000,
  salt: salt.toString('hex'),
  iv: iv.toString('hex'),
  ciphertext: webCryptoCiphertext.toString('hex'),
  itemCount: items.length
};

console.log('=== 加密结果 (复制后替换 links.json 中的 encryptedVault.crypto) ===');
console.log(JSON.stringify(output, null, 2));
console.log('当前密码:', password);
