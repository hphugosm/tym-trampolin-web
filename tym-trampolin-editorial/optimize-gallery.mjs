// Re-encode exact archival photographs; originals remain available to the lightbox.
// Requires cwebp 1.5.0 on PATH. No npm dependencies or source image modifications.
import {mkdirSync, mkdtempSync, rmSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const widths=[480,800,1200];
const output=root+'gallery-assets/';
mkdirSync(output,{recursive:true});
const entries=[];
function orientation(bytes){
 const at=bytes.indexOf(Buffer.from('Exif\0\0'));if(at<0)return 1;
 const t=bytes.subarray(at+6),le=t.toString('ascii',0,2)==='II';
 const u16=n=>le?t.readUInt16LE(n):t.readUInt16BE(n),u32=n=>le?t.readUInt32LE(n):t.readUInt32BE(n);
 const offset=u32(4),count=u16(offset);
 for(let j=0;j<count;j++){const p=offset+2+j*12;if(u16(p)===274)return u16(p+8)}
 return 1;
}
const temp=mkdtempSync(join(tmpdir(),'tt-gallery-'));
try {
for(let i=1;i<=15;i++){
 const id=String(i).padStart(2,'0'), source=root+`dist/assets/gallery/${id}.jpg`;
 const rotation=orientation(readFileSync(source));
 if(![1,3,6,8].includes(rotation))throw new Error(`Unsupported EXIF orientation ${rotation}`);
 const portrait=rotation===6||rotation===8;
 const sourceWidth=portrait?1500:2000,sourceHeight=portrait?2000:1500;
 let normalized=source;
 if(rotation!==1){
  normalized=join(temp,`${id}.png`);
  execFileSync('sips',['-s','format','png','-r',String({3:180,6:90,8:270}[rotation]),source,'--out',normalized],{stdio:'ignore'});
 }
 const variants=[];
 for(const width of widths){
  const file=`${id}-${width}.webp`,target=output+file;
  execFileSync('cwebp',['-quiet','-mt','-q','78','-m','6','-metadata','none','-resize',String(width),'0',normalized,'-o',target]);
  const bytes=readFileSync(target);
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw new Error(`Invalid WebP: ${file}`);
  variants.push({file,width,height:Math.round(width*sourceHeight/sourceWidth),bytes:bytes.length});
 }
 entries.push({original:`${id}.jpg`,originalBytes:statSync(source).size,width:sourceWidth,height:sourceHeight,variants});
}
} finally {rmSync(temp,{recursive:true,force:true})}
writeFileSync(output+'manifest.json',JSON.stringify({encoder:'cwebp 1.5.0',quality:78,method:6,widths,entries},null,2)+'\n');
const original=entries.reduce((n,e)=>n+e.originalBytes,0);
console.log(JSON.stringify({originalBytes:original,variants:widths.map(width=>{const bytes=entries.reduce((n,e)=>n+e.variants.find(v=>v.width===width).bytes,0);return {width,bytes,savedPercent:Math.round((1-bytes/original)*1000)/10}})},null,2));
