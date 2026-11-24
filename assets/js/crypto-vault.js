/**
 * Shared AES-256-GCM + PBKDF2-SHA256 Vault Crypto Module
 * Supports both Browser (window.VaultCrypto) and Node.js (CommonJS).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VaultCrypto = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VAULT_CRYPTO_DEFAULTS = Object.freeze({
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    saltBytes: 16,
    ivBytes: 12
  });

  function getCryptoApi() {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      return globalThis.crypto;
    }
    if (typeof require === 'function') {
      try {
        const nodeCrypto = require('crypto');
        if (nodeCrypto && nodeCrypto.webcrypto && nodeCrypto.webcrypto.subtle) {
          return nodeCrypto.webcrypto;
        }
      } catch (_) {
        // Ignore in non-Node environments
      }
    }
    const err = new Error('Web Crypto API (crypto.subtle) is unavailable. Use HTTPS or localhost.');
    err.code = 'CRYPTO_UNAVAILABLE';
    throw err;
  }

  function hexToBytes(hex) {
    if (typeof hex !== 'string' || hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error('Invalid hex input');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function deriveAesGcmKey(cryptoApi, password, salt, iterations, usages) {
    const pwKey = await cryptoApi.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return cryptoApi.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: iterations || VAULT_CRYPTO_DEFAULTS.iterations,
        hash: 'SHA-256'
      },
      pwKey,
      { name: 'AES-GCM', length: 256 },
      false,
      usages
    );
  }

  async function encryptVault(password, itemsArray, iterations = VAULT_CRYPTO_DEFAULTS.iterations) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }
    if (!Array.isArray(itemsArray)) {
      throw new Error('Items must be an array');
    }

    const cryptoApi = getCryptoApi();
    const salt = cryptoApi.getRandomValues(new Uint8Array(VAULT_CRYPTO_DEFAULTS.saltBytes));
    const iv = cryptoApi.getRandomValues(new Uint8Array(VAULT_CRYPTO_DEFAULTS.ivBytes));
    const derivedKey = await deriveAesGcmKey(cryptoApi, password, salt, iterations, ['encrypt']);
    const plaintext = new TextEncoder().encode(JSON.stringify(itemsArray));

    const ciphertextWithTag = await cryptoApi.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      plaintext
    );

    return {
      algorithm: VAULT_CRYPTO_DEFAULTS.algorithm,
      kdf: VAULT_CRYPTO_DEFAULTS.kdf,
      iterations,
      salt: bytesToHex(salt),
      iv: bytesToHex(iv),
      ciphertext: bytesToHex(new Uint8Array(ciphertextWithTag)),
      itemCount: itemsArray.length
    };
  }

  async function decryptVault(password, cryptoData) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }
    if (!cryptoData || !cryptoData.salt || !cryptoData.iv || !cryptoData.ciphertext) {
      throw new Error('Invalid vault crypto payload');
    }

    const cryptoApi = getCryptoApi();
    const salt = hexToBytes(cryptoData.salt);
    const iv = hexToBytes(cryptoData.iv);
    const ciphertextWithTag = hexToBytes(cryptoData.ciphertext);
    const iterations = Number(cryptoData.iterations) || VAULT_CRYPTO_DEFAULTS.iterations;

    const derivedKey = await deriveAesGcmKey(cryptoApi, password, salt, iterations, ['decrypt']);
    const decryptedBuf = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      ciphertextWithTag
    );

    const parsed = JSON.parse(new TextDecoder().decode(decryptedBuf));
    if (!Array.isArray(parsed)) {
      throw new Error('Decrypted payload is not an array');
    }
    return parsed;
  }

  return {
    VAULT_CRYPTO_DEFAULTS,
    hexToBytes,
    bytesToHex,
    encryptVault,
    decryptVault
  };
});
