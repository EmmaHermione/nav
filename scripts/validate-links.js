/**
 * Lightweight validator for links.json structure and URL safety.
 * Usage: node scripts/validate-links.js
 */

const fs = require('fs');
const path = require('path');

const linksPath = path.resolve(__dirname, '..', 'links.json');

function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  const trimmed = url.trim();
  if (/^(\.\/|\/|assets\/)/i.test(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function main() {
  if (!fs.existsSync(linksPath)) {
    console.error('Missing links.json');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  } catch (err) {
    console.error(`Invalid JSON in links.json: ${err.message}`);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const seenIds = new Set();

  if (!data.site || !data.site.title) {
    errors.push('site.title is required');
  }

  if (!Array.isArray(data.searchEngines) || data.searchEngines.length === 0) {
    errors.push('searchEngines must be a non-empty array');
  } else {
    data.searchEngines.forEach((eng, idx) => {
      if (!eng.id || !eng.name || !isSafeUrl(eng.url)) {
        errors.push(`searchEngines[${idx}] is missing id, name, or safe url`);
      }
    });
  }

  if (!Array.isArray(data.categories)) {
    errors.push('categories must be an array');
  } else {
    data.categories.forEach((cat, cIdx) => {
      if (!cat.id || !cat.name) {
        errors.push(`categories[${cIdx}] missing id or name`);
      } else if (seenIds.has(cat.id)) {
        errors.push(`Duplicate category id: ${cat.id}`);
      } else {
        seenIds.add(cat.id);
      }

      if (!Array.isArray(cat.items)) {
        errors.push(`categories[${cIdx}].items must be an array`);
        return;
      }

      cat.items.forEach((item, iIdx) => {
        if (!item.title) {
          errors.push(`categories[${cIdx}].items[${iIdx}] missing title`);
        }
        if (!isSafeUrl(item.url)) {
          errors.push(`categories[${cIdx}].items[${iIdx}] (${item.title || 'untitled'}) has invalid/unsafe url: ${item.url}`);
        }
        if (item.icon && !isSafeUrl(item.icon)) {
          warnings.push(`categories[${cIdx}].items[${iIdx}] (${item.title}) has questionable icon url: ${item.icon}`);
        }
      });
    });
  }

  if (data.encryptedVault) {
    const v = data.encryptedVault;
    if (!v.id || !v.name) errors.push('encryptedVault missing id or name');
    if (seenIds.has(v.id)) errors.push(`Duplicate section id: ${v.id}`);
    const c = v.crypto;
    if (!c || !c.salt || !c.iv || !c.ciphertext) {
      errors.push('encryptedVault.crypto must include salt, iv, and ciphertext');
    }
  }

  if (warnings.length) {
    console.warn(`Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('links.json validation passed.');
}

main();
