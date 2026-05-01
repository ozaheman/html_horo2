const fs = require('fs');
const path = require('path');

function cleanTranscript(text) {
  let cleaned = text.replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '');
  cleaned = cleaned.replace(/^\d+$/gm, '');
  cleaned = cleaned.replace(/\[music\]|\[संगीत\]/gi, '');
  return cleaned.replace(/\n\s*\n/g, '\n').trim();
}

function processDirectory(dirPath, outputFileName, varName) {
  if (!fs.existsSync(dirPath)) {
      console.log(`Directory ${dirPath} does not exist. Skipping.`);
      return;
  }
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.txt'));
  if (files.length === 0) return;

  let database = [];

  files.forEach(file => {
    console.log(`Processing ${file}...`);
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    
    if (content.includes('## ')) {
      const lines = content.split('\n');
      let currentTopic = null;
      let currentText = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('## ')) {
          if (currentTopic) {
            database.push({ topic: currentTopic, text: cleanTranscript(currentText.join('\n')) });
          }
          currentTopic = line.substring(3).trim();
          currentText = [];
        } else if (currentTopic) {
          currentText.push(line);
        }
      }
      if (currentTopic) {
        database.push({ topic: currentTopic, text: cleanTranscript(currentText.join('\n')) });
      }
    } else {
      const topicName = file.replace('.txt', '').replace(/Copy/g, '').replace(/Video_part\d+/g, '').trim();
      database.push({ topic: topicName, text: cleanTranscript(content) });
    }
  });

  const outputData = `window.${varName} = ${JSON.stringify(database)};\n`;
  const outPath = path.join(__dirname, outputFileName);
  fs.writeFileSync(outPath, outputData);
  console.log(`Successfully compiled ${files.length} text files into ${outputFileName} as ${varName}`);
}

const rootDir = path.resolve(__dirname, '../../prediction');

// Automatically process ALL directories inside prediction folder
const dirs = fs.readdirSync(rootDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const generatedScripts = [];

dirs.forEach(d => {
    const sanitizedVar = d.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const sanitizedFile = d.replace(/[^a-zA-Z0-9]/g, '_') + '_db.js';
    processDirectory(path.join(rootDir, d), sanitizedFile, sanitizedVar + '_DB');
    generatedScripts.push(sanitizedFile);
});

// Also create custom_db_en and hi
// ... skipped for brevity, keeping only the text parser.
console.log('Generated Files: ', generatedScripts.join(', '));
