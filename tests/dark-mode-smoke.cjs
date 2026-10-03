const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark'});
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{document.documentElement.dataset.theme='dark';localStorage.setItem('td-theme','dark')});
  const nav=await page.locator('.nav-item[data-page]').evaluateAll(es=>es.map(e=>e.dataset.page));
  if(!nav.length) throw new Error('No published navigation pages became available');
  const results=[];
  for(const id of nav){
    await page.locator('.nav-item[data-page="'+id+'"]').click();
    await page.waitForTimeout(200);
    const bad=await page.evaluate(()=>{
      const parse=s=>{const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(Number);return[p[0],p[1],p[2],Number.isFinite(p[3])?p[3]:1]};
      const lum=a=>{const f=v=>(v/=255)<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);return .2126*f(a[0])+.7152*f(a[1])+.0722*f(a[2])};
      const cr=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
      const bg=e=>{for(let n=e;n;n=n.parentElement){const c=parse(getComputedStyle(n).backgroundColor);if(c&&c[3]>.95)return c}return[9,13,18,1]};
      return [...document.querySelectorAll('.page.active *')].flatMap(e=>{
        const s=getComputedStyle(e),r=e.getBoundingClientRect();
        if(r.width<1||r.height<1||s.display==='none'||s.visibility==='hidden'||+s.opacity<.2||e.closest('canvas,svg,iframe,script,style'))return[];
        const text=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').replace(/\s+/g,' ').trim();
        if(!text||text.length<2)return[];
        const fg=parse(s.color),b=bg(e);if(!fg)return[];
        const ratio=cr(fg,b),fs=parseFloat(s.fontSize)||14,fw=parseInt(s.fontWeight)||400,min=(fs>=24||(fs>=18.66&&fw>=700))?3:4.5;
        return ratio<min?[{text:text.slice(0,70),ratio:+ratio.toFixed(2),min,cls:e.className||e.tagName}]:[];
      });
    });
    console.log('PAGE',id,'FAILURES',bad.length);
    bad.slice(0,20).forEach(x=>console.log(JSON.stringify(x)));
    results.push(...bad.map(x=>({...x,page:id})));
  }
  console.log('TOTAL_FAILURES',results.length);
  await browser.close();
  if(results.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(2)});