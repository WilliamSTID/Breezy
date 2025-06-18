const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv() {
    const globalEnvPath = path.resolve(__dirname, '../../global.env'); // ← renommé lors de la copie
    const localEnvPath  = path.resolve(__dirname, '../../.env');

    if (fs.existsSync(globalEnvPath)) {
        dotenv.config({ path: globalEnvPath });
        console.log('[dotenv] ✅ .env global chargé');
    } else {
        console.warn('[dotenv] ⚠️  .env global introuvable');
    }

    if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath, override: true });
        console.log('[dotenv] ✅ .env local chargé');
    } else {
        console.warn('[dotenv] ⚠️  .env local introuvable');
    }
}

module.exports = loadEnv;
