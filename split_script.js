const fs = require('fs');
const content = fs.readFileSync('ayse_site.html', 'utf-8');

const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);

if (styleMatch) fs.writeFileSync('style.css', styleMatch[1].trim());
if (scriptMatch) fs.writeFileSync('script.js', scriptMatch[1].trim());

// Update HTML
let newHtml = content.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="style.css">');
newHtml = newHtml.replace(/<script>[\s\S]*?<\/script>/, '<script src="script.js"><\/script>');

// Update the compliment while we are at it
newHtml = newHtml.replace(
    'Seni o kadar çok seviyorum ki, dünyadaki tüm pırlantalardan daha değerlisin bebeğim! 💎✨',
    'Sadece ellerini tuttuğumda değil, aklına her geldiğinde kalbimin ritmini değiştiren tek mucizesin... Seni her şeyden çok seviyorum bebeğim. 🦋🥺'
);

fs.writeFileSync('ayse_site.html', newHtml);
console.log('Successfully split files and updated compliment!');
