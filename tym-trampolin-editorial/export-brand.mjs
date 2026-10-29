// Faithful raster-mask exports of the supplied logo. No paths are redrawn.
// Run: SHARP_MODULE_ROOT=/absolute/path/to/node_modules node export-brand.mjs
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp')}catch{if(!process.env.SHARP_MODULE_ROOT)throw new Error('Provide sharp 0.35.5 via SHARP_MODULE_ROOT');sharp=createRequire(resolve(process.env.SHARP_MODULE_ROOT,'../package.json'))('sharp')}
const original=readFileSync(new URL('./brand/tt-original.png',import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
if(sha(original)!=='60614bec4814b148a48f8c7cf6aaecb33c3e7dd3a1e27125327b971710ae4a93')throw new Error('Unexpected original logo');
const {data,info}=await sharp(original).removeAlpha().raw().toBuffer({resolveWithObject:true});
const rgba=Buffer.alloc(info.width*info.height*4);let sourceBox=[info.width,info.height,0,0],maskBox=[info.width,info.height,0,0],solid=0,transparent=0;
for(let i=0,p=0;i<data.length;i+=3,p+=4){
 const chroma=data[i+2]-data[i];
 // The source's paper is neutral (B-R <= 3); the blue ink peaks at 252–253.
 const alpha=Math.round(Math.max(0,Math.min(1,(chroma-3)/249))*255);
 rgba[p]=rgba[p+1]=rgba[p+2]=255;rgba[p+3]=alpha;
 const x=(i/3)%info.width,y=Math.floor(i/3/info.width);
 for(const [box,on] of [[sourceBox,chroma>3],[maskBox,alpha>0]])if(on){box[0]=Math.min(box[0],x);box[1]=Math.min(box[1],y);box[2]=Math.max(box[2],x);box[3]=Math.max(box[3],y)}
 if(alpha===0)transparent++;if(alpha===255)solid++;
}
const mask=await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).png({compressionLevel:9,adaptiveFiltering:false}).toBuffer();
const svg=(view)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${view[2]}" height="${view[3]}" viewBox="${view.join(' ')}"><title>Tým Trampolín — supplied symbol</title><defs><mask id="ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024" style="mask-type:alpha"><image width="1536" height="1024" href="data:image/png;base64,${mask.toString('base64')}"/></mask></defs><rect width="1536" height="1024" fill="#173DA5" mask="url(#ink)"/></svg>\n`;
const symbol=svg([320,168,896,672]),icon=svg([320,64,896,896]);
const files=[];
for(const [file,width,height,input] of [['tt-symbol-small.webp',112,84,symbol],['tt-symbol.webp',336,252,symbol],['tt-icon.webp',64,64,icon],['tt-touch.webp',180,180,icon],['favicon.png',64,64,icon],['apple-touch-icon.png',180,180,icon]]){
 let image=sharp(Buffer.from(input),{density:72}).resize(width,height,{kernel:'lanczos3'});
 // Keep the unassociated RGB exactly the brand blue even at antialiased edges.
 const {data:pixels,info:shape}=await image.ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=0;i<pixels.length;i+=4){pixels[i]=23;pixels[i+1]=61;pixels[i+2]=165}
 image=sharp(pixels,{raw:{width:shape.width,height:shape.height,channels:4}});
 const bytes=file.endsWith('.png')?await image.png({compressionLevel:9,adaptiveFiltering:false}).toBuffer():await image.webp({lossless:true,effort:6,exact:true}).toBuffer();
 writeFileSync(new URL('./brand/'+file,import.meta.url),bytes);files.push({file,width,height,bytes:bytes.length,sha256:sha(bytes)});
}
writeFileSync(new URL('./brand/tt-symbol.svg',import.meta.url),symbol);writeFileSync(new URL('./brand/tt-icon.svg',import.meta.url),icon);
writeFileSync(new URL('./brand/export-report.json',import.meta.url),JSON.stringify({sourceSha256:sha(original),color:'#173DA5',sourceInkBBox:sourceBox,maskInkBBox:maskBox,transparentSourcePixels:transparent,solidSourcePixels:solid,files},null,2)+'\n');
console.log(JSON.stringify({sourceBox,maskBox,transparent,solid,files},null,2));
