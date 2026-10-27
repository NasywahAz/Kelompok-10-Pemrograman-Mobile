const fs = require('fs');
const {
  DATA_DIR,
  USERS_FILE_PATH,
  REVOKED_TOKENS_FILE_PATH,
} = require('../config/config');

// Memastikan direktori dan file data pengguna & token dicabut tersedia tanpa menimpa data yang sudah ada
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE_PATH)) {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
  if (!fs.existsSync(REVOKED_TOKENS_FILE_PATH)) {
    fs.writeFileSync(REVOKED_TOKENS_FILE_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

// Alias untuk kompatibilitas kode sebelumnya
function initUsersStorage() {
  initStorage();
}

// Helper untuk membaca daftar pengguna dari users.json
function readUsers() {
  initStorage();
  try {
    const rawData = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('[Storage Error] Gagal membaca users.json:', error);
    return [];
  }
}

// Helper untuk menyimpan daftar pengguna ke users.json
function writeUsers(users) {
  initStorage();
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('[Storage Error] Gagal menulis ke users.json:', error);
    throw error;
  }
}

// Helper untuk membaca daftar token yang telah dicabut dari revoked_tokens.json
function readRevokedTokens() {
  initStorage();
  try {
    const rawData = fs.readFileSync(REVOKED_TOKENS_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('[Storage Error] Gagal membaca revoked_tokens.json:', error);
    return [];
  }
}

// Helper untuk menyimpan daftar token yang telah dicabut ke revoked_tokens.json
function writeRevokedTokens(tokens) {
  initStorage();
  try {
    fs.writeFileSync(REVOKED_TOKENS_FILE_PATH, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('[Storage Error] Gagal menulis ke revoked_tokens.json:', error);
    throw error;
  }
}

// Helper untuk memeriksa apakah token sudah dicabut (revoked / blacklist)
function isTokenRevoked(token) {
  const revokedList = readRevokedTokens();
  return revokedList.some((item) => (typeof item === 'string' ? item === token : item.token === token));
}

// Helper untuk mencabut token (menyimpannya ke revoked_tokens.json)
function revokeToken(token, user) {
  const revokedList = readRevokedTokens();
  const alreadyRevoked = revokedList.some((item) => (typeof item === 'string' ? item === token : item.token === token));
  if (!alreadyRevoked) {
    revokedList.push({
      token,
      userId: user ? user.id : null,
      email: user ? user.email : null,
      expiresAt: user && user.exp ? new Date(user.exp * 1000).toISOString() : null,
      revokedAt: new Date().toISOString(),
    });
    writeRevokedTokens(revokedList);
  }
}

module.exports = {
  initStorage,
  initUsersStorage,
  readUsers,
  writeUsers,
  readRevokedTokens,
  writeRevokedTokens,
  isTokenRevoked,
  revokeToken,
};
