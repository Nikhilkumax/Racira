import http from 'http';

const cb = Math.random().toString(36).substring(7);

const urls = [
  'http://localhost:3002/3d/tool/3d-model-viewer-gltf-obj-stl',
  'http://localhost:3002/colors/tools/color-converter'
];

urls.forEach(url => {
  const reqUrl = `${url}?cb=${cb}`;
  http.get(reqUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[Verification] ${url} returned status ${res.statusCode}`);
      if (res.statusCode !== 200) {
         console.log(data.substring(0, 1000));
      }
    });
  });
});
