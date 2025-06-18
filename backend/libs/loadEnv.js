// apps/<service>/src/loadEnv.js
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv() {
    const globalEnvPath = path.resolve(__dirname, '../../../.env');   // backend/.env
    const localEnvPath  = path.resolve(__dirname, '../.env');         // apps/<service>/.env

    // Charger le .env global
    if (fs.existsSync(globalEnvPath)) {
        dotenv.config({ path: globalEnvPath });
        console.log(`[dotenv] .env global chargé : ${globalEnvPath}`);
    } else {
        console.warn(`[dotenv] Fichier global introuvable : ${globalEnvPath}`);
    }

    // Charger le .env local, qui peut écraser les valeurs globales
    if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath, override: true });
        console.log(`[dotenv] .env local chargé : ${localEnvPath}`);
    } else {
        console.warn(`[dotenv] Fichier local introuvable : ${localEnvPath}`);
    }
}

module.exports = loadEnv;
