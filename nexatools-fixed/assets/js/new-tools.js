
(() => {
 const $ = s => document.querySelector(s);
 const out = (html) => { const el=$("#result"); if(el) el.innerHTML=html; };
 const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const copyButton = value => `<button class="btn btn-secondary" id="copyOutput" type="button">Copy result</button>`;
 const showText = (value, note="") => {
   out(`<label class="field output-label">Result<textarea id="toolOutput" readonly>${esc(value)}</textarea></label><div class="output-actions"><button class="btn btn-secondary" id="copyOutput" type="button">Copy result</button></div>${note?`<p class="result-note">${esc(note)}</p>`:""}`);
   $("#copyOutput")?.addEventListener("click", async()=>{try{await navigator.clipboard.writeText(value);$("#copyOutput").textContent="Copied";}catch(e){$("#copyOutput").textContent="Select and copy";}});
 };
 const setText = (el, value) => { if(el) el.textContent=value; };
 const bind = (id, fn) => { const el=$("#"+id); if(el) el.addEventListener("click",fn); };
 const get = id => $("#"+id)?.value ?? "";
 const num = id => Number(get(id));
 const words = s => (s.trim().match(/\S+/g)||[]);
 const bytesToBase64 = s => {const bytes=new TextEncoder().encode(s);let bin="";bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin);};
 const base64ToText = s => {const bin=atob(s.trim());const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return new TextDecoder("utf-8",{fatal:true}).decode(bytes);};
 const csvParse = text => {
   const rows=[];let row=[],cell="",quoted=false;
   for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
     if(quoted){if(c==='"'&&n==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
     else if(c==='"')quoted=true;
     else if(c===','){row.push(cell);cell="";}
     else if(c==='\n'){row.push(cell);rows.push(row);row=[];cell="";}
     else if(c!=='\r')cell+=c;
   }
   row.push(cell);rows.push(row);
   if(quoted) throw new Error("A quoted CSV field was not closed.");
   return rows.filter(r=>!(r.length===1&&r[0]===""));
 };
 const csvCell = value => {let s=value==null?"":String(value);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 const luminance = hex => {
   const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
   return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
 };
 const id=document.body.dataset.tool;
 if(id==="password-generator"){
   const range=$("#passLength");range?.addEventListener("input",()=>setText($("#lengthOut"),range.value));
   bind("generatePassword",()=>{
     let chars="",groups=[];
     if($("#passUpper").checked)groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
     if($("#passLower").checked)groups.push("abcdefghijklmnopqrstuvwxyz");
     if($("#passNumbers").checked)groups.push("0123456789");
     if($("#passSymbols").checked)groups.push("!@#$%^&*()-_=+[]{}:,.?");
     if(!groups.length)return out('<span class="error">Choose at least one character group.</span>');
     chars=groups.join("");const length=Number(range.value),random=new Uint32Array(length);crypto.getRandomValues(random);
     let result=Array.from(random,x=>chars[x%chars.length]);
     // Ensure each selected group appears at least once, then shuffle.
     groups.forEach((g,i)=>{if(!result.some(c=>g.includes(c)))result[i]=g[random[i]%g.length];});
     for(let i=result.length-1;i>0;i--){const j=random[i]%(i+1);[result[i],result[j]]=[result[j],result[i]];}
     showText(result.join(""),"Generated in this browser. Save it in a password manager.");
   });
 }
 if(id==="random-number-generator") bind("generateNumbers",()=>{
   const min=num("randomMin"),max=num("randomMax"),count=num("randomCount"),unique=$("#randomUnique").checked;
   if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||max<min||!Number.isInteger(count)||count<1||count>100)return out('<span class="error">Enter a valid whole-number range and a count from 1 to 100.</span>');
   if(unique&&count>max-min+1)return out('<span class="error">There are not enough unique numbers in that range.</span>');
   const values=[];while(values.length<count){const a=new Uint32Array(1);crypto.getRandomValues(a);const v=min+(a[0]%(max-min+1));if(!unique||!values.includes(v))values.push(v);}
   showText(values.join(", "));
 });
 if(id==="stopwatch"){
   let start=0,elapsed=0,tick=null,laps=[],lastLap=0;
   const display=()=>{const ms=elapsed+(tick?performance.now()-start:0),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000),d=Math.floor(ms%1000/100);setText($("#stopwatchDisplay"),`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${d}`);};
   bind("swStart",()=>{if(tick){elapsed+=performance.now()-start;clearInterval(tick);tick=null;$("#swStart").textContent="Resume";}else{start=performance.now();tick=setInterval(display,80);$("#swStart").textContent="Pause";}});
   bind("swLap",()=>{const ms=elapsed+(tick?performance.now()-start:0);if(!ms)return;const split=ms-lastLap;lastLap=ms;laps.push({total:ms,split});$("#lapList").innerHTML=laps.map((v,i)=>`<div class="lap-row"><span>Lap ${i+1} · ${(v.split/1000).toFixed(2)} s</span><b>${(v.total/1000).toFixed(2)} s total</b></div>`).join("");});
   bind("swReset",()=>{clearInterval(tick);tick=null;elapsed=0;laps=[];lastLap=0;setText($("#swStart"),"Start");$("#lapList").innerHTML="";display();});
   display();
 }
 if(id==="countdown-timer"){
   let remaining=300,initial=300,tick=null;
   const display=()=>setText($("#countdownDisplay"),`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`);
   const resetFromInputs=()=>{remaining=Math.max(0,num("timerMinutes")*60+num("timerSeconds"));initial=remaining;display();};
   $("#timerMinutes")?.addEventListener("change",resetFromInputs);$("#timerSeconds")?.addEventListener("change",resetFromInputs);
   bind("cdStart",()=>{if(tick||remaining<=0)return;setText($("#countdownStatus"),"Timer running");tick=setInterval(()=>{remaining=Math.max(0,remaining-1);display();if(!remaining){clearInterval(tick);tick=null;setText($("#countdownStatus"),"Time is up.");}},1000);});
   bind("cdPause",()=>{clearInterval(tick);tick=null;setText($("#countdownStatus"),"Paused");});
   bind("cdReset",()=>{clearInterval(tick);tick=null;remaining=initial;display();setText($("#countdownStatus"),"Ready when you are.");});
   resetFromInputs();
 }
 if(id==="reading-time-calculator"){
   bind("readingCalculate",()=>{const text=get("readingText"),count=words(text).length,speed=num("readingSpeed")||230,mins=count/speed,display=mins<1?`${Math.max(1,Math.ceil(mins*60))} seconds`:`${Math.floor(mins)} min ${Math.round((mins%1)*60)} sec`;out(`<div class="result-number">${count?display:"0 min"}</div><p>${count.toLocaleString()} words · ${speed} words per minute</p>`);});
 }
 if(id==="text-cleaner") bind("cleanText",()=>{
   let s=get("cleanInput");if($("#cleanTrim").checked)s=s.split(/\r?\n/).map(x=>x.trim()).join("\n");
   if($("#cleanSpaces").checked)s=s.replace(/[ \t]{2,}/g," ");
   if($("#cleanBlank").checked)s=s.replace(/\n(?:[ \t]*\n){1,}/g,"\n\n").replace(/^\n+|\n+$/g,"");
   showText(s);
 });
 if(id==="duplicate-line-remover") bind("removeDuplicates",()=>{
   const lines=get("duplicateInput").split(/\r?\n/),seen=new Set(),outLines=[];
   for(const line of lines){const trimmed=line.trim();if(!trimmed)continue;const key=$("#duplicateIgnoreCase").checked?trimmed.toLocaleLowerCase():trimmed;if(!seen.has(key)){seen.add(key);outLines.push(line);}}
   showText(outLines.join("\n"),`${lines.filter(x=>x.trim()).length-outLines.length} duplicate line(s) removed.`);
 });
 if(id==="find-and-replace") bind("replaceAll",()=>{
   const find=get("findValue");if(!find)return out('<span class="error">Enter the text you want to find.</span>');
   const source=get("replaceText"),needle=$("#replaceCase").checked?find.toLowerCase():find.toLowerCase();
   const flags=$("#replaceCase").checked?"g":"gi";
   const escaped=find.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
   const re=new RegExp(escaped,flags);const count=(source.match(re)||[]).length;showText(source.replace(re,get("replaceValue")),`${count} replacement(s) made.`);
 });
 if(id==="url-encoder-decoder"){
   bind("urlEncode",()=>showText(encodeURIComponent(get("urlInput"))));
   bind("urlDecode",()=>{try{showText(decodeURIComponent(get("urlInput")));}catch(e){out('<span class="error">This is not valid URL-encoded text. Check the percent codes.</span>');}});
 }
 if(id==="base64-encoder-decoder"){
   bind("baseEncode",()=>{try{showText(bytesToBase64(get("baseInput")));}catch(e){out('<span class="error">Could not encode this text.</span>');}});
   bind("baseDecode",()=>{try{showText(base64ToText(get("baseInput")));}catch(e){out('<span class="error">This is not valid UTF-8 Base64 text.</span>');}});
 }
 if(id==="html-entity-encoder"){
   bind("entityEncode",()=>{const d=document.createElement("div");d.textContent=get("entityInput");showText(d.innerHTML);});
   bind("entityDecode",()=>{const d=document.createElement("textarea");d.innerHTML=get("entityInput");showText(d.value);});
 }
 if(id==="slug-generator") bind("makeSlug",()=>{
   const slug=get("slugInput").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
   showText(slug);
 });
 if(id==="lorem-ipsum-generator") bind("makeLorem",()=>{
   const paras=Math.max(1,Math.min(12,num("loremCount")||1)),len=get("loremLength"),pool=[
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed neque interdum facilisis.",
    "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui.",
    "Aenean lacinia bibendum nulla sed consectetur. Cras mattis consectetur purus sit amet fermentum.",
    "Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper.",
    "Curabitur blandit tempus porttitor. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis."
   ];const sentences=len==="short"?1:len==="long"?5:3;let output=[];for(let i=0;i<paras;i++){let p=[];for(let j=0;j<sentences;j++)p.push(pool[(i+j)%pool.length]);output.push(p.join(" "));}showText(output.join("\n\n"),"Placeholder text only — replace it with your final copy.");
 });
 if(id==="word-frequency-counter") bind("analyseFrequency",()=>{
   const stop=new Set("a an and are as at be by for from has have he in is it its of on or that the this to was were will with you your i we they".split(" "));
   const counts=new Map(),tokens=(get("frequencyInput").toLowerCase().match(/[\p{L}\p{N}']+/gu)||[]);
   tokens.forEach(w=>{if(!$("#frequencyStop").checked||!stop.has(w))counts.set(w,(counts.get(w)||0)+1);});
   const rows=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,Math.max(5,Math.min(50,num("frequencyLimit")||15)));
   if(!rows.length)return out("No words found in the text.");
   out(`<div class="frequency-table"><div class="frequency-head"><b>Word</b><b>Count</b></div>${rows.map(([w,n])=>`<div class="frequency-row"><span>${esc(w)}</span><b>${n}</b></div>`).join("")}</div><p class="result-note">${tokens.length} words analysed.</p>`);
 });
 if(id==="csv-to-json") bind("convertCsvJson",()=>{
   try{const rows=csvParse(get("csvInput"));if(rows.length<2)throw new Error("Add a header row and at least one data row.");const headers=rows[0].map((h,i)=>h.trim()||`column_${i+1}`);const data=rows.slice(1).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??""])));showText(JSON.stringify(data,null,2));}
   catch(e){out(`<span class="error">${esc(e.message)}</span>`);}
 });
 if(id==="json-to-csv") bind("convertJsonCsv",()=>{
   try{const data=JSON.parse(get("jsonCsvInput"));if(!Array.isArray(data)||!data.length||data.some(x=>!x||typeof x!=="object"||Array.isArray(x)))throw new Error("Enter a non-empty JSON array of objects.");const keys=[...new Set(data.flatMap(x=>Object.keys(x)))];const rows=[keys.map(csvCell).join(","),...data.map(obj=>keys.map(k=>csvCell(obj[k])).join(","))];showText(rows.join("\n"));}
   catch(e){out(`<span class="error">${esc(e.message)}</span>`);}
 });
 if(id==="markdown-preview"){
   const render=()=>{
     const raw=get("markdownInput"),safe=esc(raw);
     let html=safe.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>")
       .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>")
       .replace(/\[([^\]]+)\]\((https?:\/\/[^ )]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
     html=html.split(/\n{2,}/).map(block=>{if(/^<h[1-3]>/.test(block))return block;if(/^(- |\* )/m.test(block))return "<ul>"+block.split("\n").map(line=>line.replace(/^[-*] /,"<li>").replace(/$/,"</li>")).join("")+"</ul>";return "<p>"+block.replace(/\n/g,"<br>")+"</p>";}).join("");
     $("#markdownOutput").innerHTML=html||'<p class="preview-placeholder">Your formatted preview will appear here.</p>';
   };
   $("#markdownInput")?.addEventListener("input",render);render();
 }
 if(id==="color-contrast-checker"){
   const update=()=>{const fg=get("contrastFg"),bg=get("contrastBg"),l1=luminance(fg),l2=luminance(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);$("#contrastSample").style.color=fg;$("#contrastSample").style.background=bg;out(`<div class="result-number">${ratio.toFixed(2)}:1</div><p>Normal text: <b>${ratio>=4.5?"AA pass":"AA fail"}</b> · Large text: <b>${ratio>=3?"AA pass":"AA fail"}</b></p><p>AAA normal text: <b>${ratio>=7?"Pass":"Fail"}</b></p>`);};
   bind("checkContrast",update);$("#contrastFg")?.addEventListener("input",update);$("#contrastBg")?.addEventListener("input",update);update();
 }
 if(id==="aspect-ratio-calculator"){
   bind("calculateRatio",()=>{const w=num("ratioWidth"),h=num("ratioHeight"),nw=num("newWidth"),nh=num("newHeight");if(w<=0||h<=0||(!nw&&!nh))return out('<span class="error">Enter positive original dimensions and one new dimension.</span>');const ratio=w/h;if(nw>0&&nh>0)return out("Enter either a new width or a new height, not both.");if(nw>0)$("#newHeight").value=Math.round(nw/ratio);else $("#newWidth").value=Math.round(nh*ratio);let a=w,b=h;while(b){const t=b;b=a%b;a=t;}const rw=w/a,rh=h/a;out(`<div class="result-number">${$("#newWidth").value} × ${$("#newHeight").value} px</div><p>Original aspect ratio ${rw}:${rh}</p>`);});
 }
 if(id==="image-metadata-viewer") $("#metadataFile")?.addEventListener("change",()=>{
   const file=$("#metadataFile").files[0];if(!file)return;const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{const ratio=img.naturalWidth/img.naturalHeight;$("#metadataPreview").innerHTML=`<img src="${url}" alt="Selected image preview">`;out(`<div class="metadata-grid"><div><small>Width</small><b>${img.naturalWidth.toLocaleString()} px</b></div><div><small>Height</small><b>${img.naturalHeight.toLocaleString()} px</b></div><div><small>File size</small><b>${(file.size/1024).toFixed(1)} KB</b></div><div><small>Format</small><b>${esc(file.type||"Unknown")}</b></div><div><small>Aspect ratio</small><b>${ratio.toFixed(3)}:1</b></div></div>`);URL.revokeObjectURL(url);};
   img.onerror=()=>out('<span class="error">The selected file could not be read as an image.</span>');img.src=url;
 });
})();
