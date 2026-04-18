const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));

let database = [];

function cleanTranscript(text) {
  // Remove SRT timestamps like 00:00:00,160 --> 00:00:03,840
  let cleaned = text.replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '');
  // Remove line numbers (digits on their own line)
  cleaned = cleaned.replace(/^\d+$/gm, '');
  // Remove [music] or [संगीत]
  cleaned = cleaned.replace(/\[music\]|\[संगीत\]/gi, '');
  // Collapse multiple newlines
  return cleaned.replace(/\n\s*\n/g, '\n').trim();
}

files.forEach(file => {
  console.log(`Processing ${file}...`);
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  if (content.includes('## ')) {
    // Existing header-based format
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
    // Raw transcript format - use filename as topic
    const topicName = file.replace('.txt', '').replace(/Copy/g, '').replace(/Video_part\d+/g, '').trim();
    database.push({ topic: topicName, text: cleanTranscript(content) });
  }
});

const outputData = `window.TUSHAR_DB = ${JSON.stringify(database)};\n`;
fs.writeFileSync(path.join(dir, 'Tushar_roy_db.js'), outputData);
console.log(`Successfully compiled ${files.length} transcript files into Tushar_roy_db.js`);
