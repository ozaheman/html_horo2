const fs = require('fs');
const wasm = fs.readFileSync('wasm/swisseph.wasm');
const data = fs.readFileSync('wasm/swisseph.data');
fs.writeFileSync('src/swisseph_offline_data.js', 'export const wasmBase64 = "' + wasm.toString('base64') + '";\nexport const dataBase64 = "' + data.toString('base64') + '";\n');
console.log('Done');
