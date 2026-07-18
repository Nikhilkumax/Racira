fetch('http://localhost:3002/colors')
  .then(r => r.text())
  .then(t => {
    console.log(t.substring(0, 500));
    const m = t.match(/Error:(.*?)\\n/);
    if (m) console.log('Parsed Error:', m[1]);
    const reactErr = t.match(/TypeError:(.*?)\\n/);
    if (reactErr) console.log('React Error:', reactErr[1]);
  });
