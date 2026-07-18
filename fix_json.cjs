const fs = require('fs');
const file = 'C:/Users/Pradeep.Parmar/OneDrive - insidemedia.net/personal/My Website/MyPersonal Profile/achievements.json';
let content = fs.readFileSync(file, 'utf8');

// The user copied the array but accidentally included the next key `"positionTypes"`
// We want to slice everything up to the first `]` that precedes `"positionTypes"`
const endIndex = content.indexOf('"positionTypes"');
if (endIndex === -1) {
    console.log("No positionTypes found. Check the file manually.");
} else {
    const trimmed = content.substring(0, endIndex);
    const lastBracket = trimmed.lastIndexOf(']');
    const finalContent = trimmed.substring(0, lastBracket + 1);
    
    try {
        const data = JSON.parse(finalContent);
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log('Successfully fixed JSON file! Length is ' + data.length);
    } catch(e) {
        console.error('Still invalid JSON:', e.message);
    }
}
