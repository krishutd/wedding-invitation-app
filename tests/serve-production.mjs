import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'};
createServer(async (req,res) => {
 try {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file;
  if(pathname === '/tests/production-assets.html') file = resolve('tests/production-assets.html');
  else {
   if(!pathname.startsWith('/wedding-invitation-app/')) { res.writeHead(404).end(); return; }
   file=resolve(root,pathname.slice('/wedding-invitation-app/'.length) || 'index.html');
   if(!file.startsWith(root+sep)) {res.writeHead(403).end(); return;}
  }
  res.writeHead(200,{'Content-Type':types[extname(file)] || 'application/octet-stream'}).end(await readFile(file));
 } catch {res.writeHead(404).end();}
}).listen(4174,'127.0.0.1',()=>console.log('Built site: http://127.0.0.1:4174/wedding-invitation-app/'));
