/**
 * Offline CLI Encryption Tool for Secret Navigation Bookmarks
 * Usage: node encrypt_tool.js <password> [json_file_path]
 */

const fs = require('fs');
const { encryptVault } = require('./assets/js/crypto-vault');

const password = process.argv[2];
const inputPath = process.argv[3];

if (!password) {
  console.error('用法: node encrypt_tool.js "<解锁密码>" [书签JSON文件路径]');
  console.error('安全提示: 为避免误用弱默认密码，请显式传入自定义密码。');
  process.exit(1);
}

let items = [
  {
    title: '私有云盘 / NAS 控制台',
    url: 'https://nas.example.com',
    description: '家庭高可用私有存储与多媒体流媒体中心',
    icon: ''
  },
  {
    title: '内网穿透与反向代理',
    url: 'https://proxy.example.com',
    description: '安全网络隧道穿透与节点网关面板',
    icon: ''
  }
];

if (inputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`错误: 找不到 JSON 文件: ${inputPath}`);
    process.exit(1);
  }
  try {
    items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    if (!Array.isArray(items)) {
      throw new Error('书签 JSON 根节点必须是数组 []');
    }
  } catch (err) {
    console.error(`错误: 解析 JSON 失败: ${err.message}`);
    process.exit(1);
  }
}

(async () => {
  try {
    const output = await encryptVault(password, items);
    console.log('=== 加密结果 (直接整段复制替换 links.json 中的 "crypto": { ... }) ===');
    console.log('"crypto": ' + JSON.stringify(output, null, 2));
    console.log(`已加密 ${items.length} 条私密书签。`);
  } catch (err) {
    console.error('加密失败:', err.message);
    process.exit(1);
  }
})();
