const fs = require("fs");
const c = fs.readFileSync(process.argv[2], "utf8");
const lines = c.split("\n");
let braces = 0;
for (let i = 0; i < lines.length; i++) {
  for (let j = 0; j < lines[i].length; j++) {
    if (lines[i][j] === "{") braces++;
    if (lines[i][j] === "}") braces--;
  }
  if (braces !== 0 && i > 17) {
    console.log(i + 1, braces, lines[i].trim().substring(0, 70));
  }
}