const http = require('http');

http.get('http://localhost:3002/seo', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // extract error message if any
    const match = data.match(/<title>(.*?)<\/title>/);
    if (match) console.log("Title: " + match[1]);
    
    // Look for error message in Next.js overlay
    const errorMatch = data.match(/data-nextjs-error-dialog-body.*?>(.*?)</s);
    if (errorMatch) console.log("Error body: " + errorMatch[1]);
    else console.log(data.substring(0, 500));
  });
});
