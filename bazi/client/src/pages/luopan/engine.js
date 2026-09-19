/** 八字罗盘拨盘（从竹简命盘原型抽出，由 React 页挂载） */
export function initLuopan(root, hooks) {
  const $ = (s) => root.querySelector(s);
/* 排盘走 React 侧 calcSingleBazi（与经典填写页同一套）。此处只保留拨盘与语音。 */
/* ══════ 一天的天色：8 个生活化时段（仅作小时环的分组底色与语音词，不再是选项） ══════ */
const SEG = [
  {n:"半夜",   h:1,  s:"子丑"}, {n:"天快亮", h:4,  s:"寅"},
  {n:"天刚亮", h:6,  s:"卯"},   {n:"上午",   h:9,  s:"辰巳"},
  {n:"中午",   h:12, s:"午"},   {n:"下午",   h:15, s:"未申"},
  {n:"傍晚",   h:18, s:"酉"},   {n:"晚上",   h:21, s:"戌亥"}
];
const SEGKEYS = [
  [/半夜|深夜|子夜|零点|凌晨/,1],[/天快亮|蒙蒙亮|快天亮|拂晓/,4],
  [/天刚亮|天亮|清晨|早上|早晨|早起|日出/,6],[/上午|早饭|晌午前/,9],
  [/中午|晌午|正午/,12],[/下午|过晌/,15],
  [/傍晚|快天黑|太阳落|日落|黄昏/,18],[/晚上|夜里|掌灯|天黑/,21]
];
const CNMAP={"零":0,"〇":0,"一":1,"壹":1,"二":2,"两":2,"贰":2,"三":3,"四":4,"五":5,"六":6,"七":7,"八":8,"九":9};
function isNum(ch){return CNMAP[ch]!==undefined||/[0-9]/.test(ch);}
function toDigits(s){let r="";for(const c of s){if(CNMAP[c]!==undefined)r+=CNMAP[c];else if(/[0-9]/.test(c))r+=c;}return r;}
function cnNum(s){
  if(/^\d+$/.test(s))return parseInt(s,10);
  let n=0,cur=0,seen=false;
  for(const ch of s){
    if(CNMAP[ch]!==undefined){cur=CNMAP[ch];seen=true;}
    else if(ch==="十"){n+=(cur||1)*10;cur=0;seen=true;}
  }
  return n+cur;
}
/* 「半 / 一刻 / 三刻 / 二十分 / 零五分」→ 分钟数 */
function minuteOf(q){
  if(!q) return 0;
  if(q==="半") return 30;
  if(q==="一刻") return 15;
  if(q==="两刻") return 30;
  if(q==="三刻") return 45;
  const s=q.replace(/分/g,"").trim();
  let v = /^\d+$/.test(s) ? parseInt(s,10) : cnNum(s);   /* 必须先走 cnNum，否则「二十」被拆成 2 */
  return (isFinite(v)&&v>=0&&v<=59)?v:0;
}
const pad2=n=>String(n).padStart(2,"0");
/* ── 中文口语 → 结构化生辰 ── */
function parseSpeech(text){
  const t=text.replace(/\s+/g,"");
  const o={y:null,m:null,d:null,hh:null,mi:0,sex:null,lunar:false,raw:text};

  /* 年份：4 位逐位读，或 2 位补 19 */
  let m=t.match(new RegExp("([〇零一二三四五六七八九十两0-9]{1,6})年"));
  if(m){
    const dg=toDigits(m[1]);
    if(dg.length===4) o.y=parseInt(dg,10);
    else if(dg.length===2){ const v=parseInt(dg,10); o.y = v>=30?1900+v:2000+v; }
    else { const v=cnNum(m[1]); if(v>=1900&&v<=2030) o.y=v; else if(v<100) o.y=v>=30?1900+v:2000+v; }
  }
  /* 月份 */
  m=t.match(new RegExp("([〇零一二三四五六七八九十两0-9]{1,3})月"));
  if(m){ o.m=cnNum(m[1])||parseInt(toDigits(m[1]),10); }
  else if(/腊月/.test(t)) o.m=12;
  else if(/冬月/.test(t)) o.m=11;
  else if(/正月/.test(t)) o.m=1;
  /* 日 */
  m=t.match(new RegExp("([〇零一二三四五六七八九十两0-9]{1,3})[日号]"));
  if(m){ o.d=cnNum(m[1])||parseInt(toDigits(m[1]),10); }
  else {
    m=t.match(new RegExp("初([〇零一二三四五六七八九十0-9]{1,2})"));
    if(m) o.d=cnNum(m[1]);
    else { m=t.match(new RegExp("月([〇零一二三四五六七八九十两0-9]{1,3})"));
      if(m) o.d=cnNum(m[1])||parseInt(toDigits(m[1]),10); }
  }
  /* 具体钟点：优先于时段词，可带分（三点半 / 三点二十 / 十五点零五分 / 三点一刻） */
  m=t.match(new RegExp("([0-9]{1,2}|[一二三四五六七八九十两]{1,3})\\s*[点时](半|一刻|两刻|三刻|([〇零一二三四五六七八九十两0-9]{1,3})\\s*分?)?"));
  if(m){ let h=/[0-9]/.test(m[1])?parseInt(m[1],10):cnNum(m[1]);
         const isPM=/(下午|过晌)/.test(t);
         const isNight=/(晚上|夜里|黄昏|掌灯|半宿|傍晚)/.test(t);
         if(isPM && h<12) h+=12;
         else if(isNight && h>=6 && h<12) h+=12;   /* 晚上两点=凌晨2点，不加12 */
         if(h>=0&&h<=23){ o.hh=h; o.mi=minuteOf(m[2]||m[3]); } }
  if(o.hh===null){ for(const [re,h] of SEGKEYS){ if(re.test(t)){ o.hh=h; o.mi=0; break; } } }
  o.lunar=/(腊月|冬月|正月|初一|初二|初三|初四|初五|初六|初七|初八|初九|初十|十五|廿|闰)/.test(t);
  /* 性别 */
  if(/(女的|女性|女士|女孩|女儿|我妈|我婆婆|我奶奶|我姥姥|我媳妇|姑娘)/.test(t)) o.sex="女";
  else if(/(男的|男性|男士|男孩|儿子|我爸|我爷爷|我姥爷|我老公|小子)/.test(t)) o.sex="男";
  else if(/女/.test(t) && !/男女|子女/.test(t)) o.sex="女";
  else if(/男/.test(t) && !/男女/.test(t)) o.sex="男";
  return o;
}

/* ══════ 状态 ══════ */
/* ↑↑↑ 历法内核 ↑↑↑ */

/* ══════════════════════════════════════════════
   一·五、农历（1920–2031）
   数据由 ICU 农历生成：每月朔日 + 月长 + 闰月位置，
   已抽样核对 1962 七月朔 7-31、2020 正月朔 1-25、2023 闰二月。
   ══════════════════════════════════════════════ */
const LU_START="1920-02-20", LU_Y0=1920;
const LU_LEAP="0060040020600500307006004002070050030800600400307005004080060040a00700500308005004002070050040900600400206005003";
const LU_DAYS="010010010111101001001011101100100101101101010010101101101010010101101101010010101101101001010101110100100101111010010010111011001001011011010100101011101010010101101101010010101101011010010101101101001001101110100100101110110010010110111001001010111010100101011011010010101011010101010101011010101010101011011001001011101100100101101110010010101110101001010110110100101010110110010101011010101010101010110101010011011011001001011011100100101011101010010101110101001010101110100101010110101010101010110101010101010110101010010110110101001010111010100101011101010010011011101001001101101100101010101101010101010101101010100101101101010010101110101001010110110100100110111010010011011101001001011101010100101101101010100101101101010100101101101010010101101101001001101110100100101111010010010111011001001011011010100101011011010100101011011010010101011011010010101011101001001011110100100101110110010010110110101001010111010100101011010110010101011010110010101011011010010011011101001001011101100100101101101010010101110101001010110110100101010110101010101010110101010101010110110010010111011001001011011100100101011101010010101101101001010101101100101010101101010101010101101010100101110101010010110110101001010111010100100111101010010011011101001010101101010101010101101010101001101101010100101101101010010101110101001001111010100100110111010010011011010101001011011010101001101";
const LU_MN=["正","二","三","四","五","六","七","八","九","十","冬","腊"];
const LU_DN=["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
const LU_IDX=(function(){
  const base=Date.UTC(1900,0,1), p=LU_START.split("-").map(Number);
  let t=Math.round((Date.UTC(p[0],p[1]-1,p[2])-base)/86400000), q=0, out=[];
  for(let i=0;i<LU_LEAP.length;i++){
    const leap=parseInt(LU_LEAP[i],36), n=12+(leap?1:0), ms=[];
    for(let j=0;j<n;j++){ const d=LU_DAYS[q+j]==="1"?30:29; ms.push({s:t,d:d,lp:(!!leap && j===leap)}); t+=d;   /* leap=0 = 无闰月，不可当闰月判 */ }
    out.push({y:LU_Y0+i,leap:leap,ms:ms}); q+=n;
  }
  return out;
})();
const D2DATE=n=>new Date(Date.UTC(1900,0,1)+n*86400000);
const DATE2D=(y,m,d)=>Math.round((Date.UTC(y,m-1,d)-Date.UTC(1900,0,1))/86400000);
/* 农历 → 公历 */
function l2s(y,m,d,lp){
  const Y=LU_IDX[y-LU_Y0]; if(!Y||d<1) return null;
  const j = lp ? (Y.leap===m?m:-1) : ((Y.leap&&m>Y.leap)?m:m-1);
  const mo=Y.ms[j]; if(!mo||d>mo.d) return null;
  const t=D2DATE(mo.s+d-1);
  return {y:t.getUTCFullYear(), m:t.getUTCMonth()+1, d:t.getUTCDate()};
}
/* 公历 → 农历 */
function s2l(y,m,d){
  const n=DATE2D(y,m,d);
  for(const Y of LU_IDX){
    const last=Y.ms[Y.ms.length-1];
    if(n<Y.ms[0].s) break;
    if(n>=last.s+last.d) continue;
    for(let j=0;j<Y.ms.length;j++){
      const mo=Y.ms[j];
      if(n>=mo.s&&n<mo.s+mo.d){
        let mm,lp=false;
        if(Y.leap&&j===Y.leap){mm=Y.leap;lp=true;}
        else if(Y.leap&&j>Y.leap){mm=j;}
        else mm=j+1;
        return {y:Y.y,m:mm,d:n-mo.s+1,lp:lp};
      }
    }
  }
  return null;
}

/* ══════════════════════════════════════════════
   二、罗盘
   ══════════════════════════════════════════════ */
/* 8 段天色的代表色 → 24 小时底色。
   用纯色而非渐变：渐变若挂在旋转的环上，天色方向会跟着转，反倒失真。 */
const SKYREP=["#1D2B54","#4E3A72","#A9603F","#93BEDC","#6FA9D0","#D8AB5F","#B85A38","#22305C"];
const HOURSEG=[0,0,0,1,1,2,2,3,3,3,3,4,4,5,5,5,5,6,6,7,7,7,7,0];   /* 小时 → 天色段 */
const hex2rgb=h=>[parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)];
function mixHex(a,b,t){
  const A=hex2rgb(a),B=hex2rgb(b);
  return "#"+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,"0")).join("");
}
function lumOf(h){const c=hex2rgb(h);return (0.299*c[0]+0.587*c[1]+0.114*c[2])/255;}
/* 多段色带：在若干色标之间按位置线性取色。
   用来让「色相」也随刻度真正推移 —— 只靠明暗交替的话，整环读起来是同一色的深浅，
   算不上「有区别的色块」。色标只给 2–3 个，中间靠插值，改起来也只动一行。 */
function ramp(stops,i,n){
  const t=n<=1?0:(i/(n-1))*(stops.length-1);
  const j=Math.min(stops.length-2,Math.max(0,Math.floor(t)));
  return mixHex(stops[j],stops[j+1],t-j);
}
/* 格上字的墨色：按 WCAG 对比度在「松烟墨 / 米白」里取更清楚的一侧。
   不用「亮度 < 0.52」这种拍出来的阈值 —— 处在中间亮度的那几格两边都不够清楚。 */
const INK_D="#241F19", INK_P="#FDFAF4";
function relLum(c){
  const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);
}
function inkOn(hex){
  const c=hex2rgb(hex), cd=relLum(c), kd=relLum(hex2rgb(INK_D)), kp=relLum(hex2rgb(INK_P));
  const rD=(Math.max(cd,kd)+0.05)/(Math.min(cd,kd)+0.05);
  const rP=(Math.max(cd,kp)+0.05)/(Math.min(cd,kp)+0.05);
  return rD>=rP?INK_D:INK_P;
}

/* ══ 逐格底色：每个刻度各自成块，相邻必可辨 ══
   两层叠加，各司其职：
   ① 色族推移 —— 承担语义（年=年代冷暖 / 月=四季 / 日=月内推进 / 时=天色段 / 分=逐分推进）
   ② 明度交替 —— 保证「任意相邻两格」都有可见亮度差。
   关键：②不去给①的成品调亮调暗，而是**先由①交出色相、再由②直接指令这一格的亮度**
   （基准亮度 ± 交替量）。按前者写，①自身的亮度漂移会与②相互抵消 —— 实测时环出现过
   相邻 ΔL=1.0 的一对（#3e3c6a / #483666：亮度完全一样，只剩色相之别），两格并成一片。
   改成直接指定亮度后，相邻差恒为「2D − ①的逐格漂移」，与色族怎么取色无关。 */
const INK_L=21.6;                                  /* #191510 的亮度，压暗时向它靠 */
const L_MIN=36, L_MAX=246;                         /* 亮度可用的上下沿，别顶到全黑或纸白 */
function setLum(h,Lt){                             /* 把颜色调到指定亮度，尽量保住色相 */
  const L=lumOf(h)*255;
  if(Lt>L){ const span=255-L; return span<1?h:mixHex(h,"#FFFFFF",Math.min(1,(Lt-L)/span)); }
  if(Lt<L){ const span=L-INK_L; return span<1?h:mixHex(h,"#191510",Math.min(1,(L-Lt)/span)); }
  return h;
}
const SEASON=["#9BD2C0","#EABFAB","#E3CB9A","#B0C4DE"];   /* 春 青 · 夏 赭 · 秋 金 · 冬 靛（参考图矿物颜料色系） */
/* ① 各环色族：给出色相/色度（语义），亮度一律交给②。
   每条色带都只给 2–3 个色标，色相差都拉开到 30° 以上 —— 这样「相邻两格」同时有
   色相差与明度差两重区分，不会出现只剩明暗、读作同一色深浅的情况。
   亮度上都刻意收在相近区间，②的推力小，不把颜色洗淡。 */
const RINGBASE={
  year : (i,n)=>ramp(["#A8BACB","#B2AEA6","#C4A986"],i,n),  /* 1930 冷青灰 → 中叶米灰 → 2010 暖砂褐 */
  month: i=>{                                               /* 一季一色族；季内三月向后一季柔推，与小时环同法 */
    const f=Math.min(3,Math.floor(i/3)), p=(i%3)/2;
    return mixHex(SEASON[f],SEASON[(f+1)%4],0.16+0.34*p);
  },
  day  : (i,n)=>ramp(["#C4D2DA","#E5D0B7","#D2A184"],i,n),  /* 月初晨青 → 月中砂 → 月末赭：月内由凉转暖 */
  hour : h=>{                                               /* 天色段：段内向后一段柔推，段界自然转身 */
    const s=HOURSEG[h];
    let len=0,pos=0;
    for(let j=0;j<24;j++) if(HOURSEG[j]===s) len++;
    for(let j=0;j<h;j++)  if(HOURSEG[j]===s) pos++;
    return mixHex(SKYREP[s],SKYREP[HOURSEG[(h+1)%24]],0.20+0.44*Math.min(1,pos/Math.max(1,len-1)));
  },
  min  : (i,n)=>ramp(["#F1EADA","#E2E0CE","#C9D2C6"],i,n)   /* 0 分米白 → 30 分素灰 → 59 分竹青：逐分推移 */
};
/* ② 交替深度（亮度/255）：格越窄越收敛，免得细密处闪成花 */
const RING_D={year:11, month:13, day:13, hour:15, min:12};
/* 逐格调色板：① 给色相 → ② 定亮度（奇偶交替）→ ③ 松弛，把「被①漂移抵消掉」的邻对推开。
   ③ 不能省：实测时环 h=6→h=7 的①是正漂 +24、②是反向 −30，净差只剩 6，两格并成一片。
   松弛只动「差不够」的那几对，幅度几档，不触动夜暗昼亮的整体走势。 */
const _pal={};
function palette(k){
  const N=RI[k].count, key=k+"|"+N;
  if(_pal[key]) return _pal[key];
  const D=RING_D[k], MIND=Math.round(D*1.3);
  const base=[], tgt=[];
  for(let i=0;i<N;i++){
    const b=RINGBASE[k](i,N);        /* 必须传 N：year/day/min 的色带靠步长取色 */
    base.push(b); tgt.push(lumOf(b)*255+((i%2)?-D:D));
  }
  for(let pass=0;pass<8;pass++){     /* 环首尾相接，多跑几遍让两侧都收敛 */
    let moved=false;
    for(let i=0;i<N;i++){
      const j=(i+1)%N, d=tgt[j]-tgt[i];
      if(Math.abs(d)>=MIND) continue;
      const s=d>0?1:(d<0?-1:((i%2)?-1:1)), push=(MIND-Math.abs(d))/2+.5;
      tgt[i]-=s*push; tgt[j]+=s*push; moved=true;
    }
    if(!moved) break;
  }
  const clamp=v=>Math.max(L_MIN,Math.min(L_MAX,v));
  const used=new Set(), out=[];
  for(let i=0;i<N;i++){
    const want=clamp(tgt[i]), dir=(i%2)?1:-1;   /* 撞色时顺本格明暗方向推开 */
    let c=setLum(base[i],want);
    for(let s=1;s<=10&&used.has(c);s++) c=setLum(base[i],clamp(want+dir*s*2));
    used.add(c); out.push(c);
  }
  return (_pal[key]=out);
}

const R_MIN=[184,206], R_HOUR=[152,180], R_DAY=[120,148], R_MON=[88,114], R_YEAR=[56,84];
const C=210;
const HLW=35;                                 /* 浮层半宽：托起窗的横向半径 */
const SEAL_R=58;                              /* 中心印半径，之内不响应拨盘 */
const RINGID={year:"rYear",month:"rMon",day:"rDay",hour:"rHour",min:"rMin"};
const RINGRO={year:"ro-year",month:"ro-month",day:"ro-day",hour:"ro-time",min:"ro-time"};

const S={y:1962,m:8,d:14,hh:15,mi:30,sex:null};
const RI={
  year:{count:81, step:360/81, th:0, g:null, hit:null, base:1930, r:R_YEAR},
  month:{count:12,step:30,    th:0, g:null, hit:null, base:1,    r:R_MON},
  day:  {count:31,step:360/31,th:0, g:null, hit:null, base:1,    r:R_DAY},
  hour: {count:24,step:15,    th:0, g:null, hit:null, base:0,    r:R_HOUR},
  min:  {count:60,step:6,     th:0, g:null, hit:null, base:0,    r:R_MIN}
};
const SVGNS="http://www.w3.org/2000/svg";
const el=(n,a)=>{const e=document.createElementNS(SVGNS,n);for(const k in a)e.setAttribute(k,a[k]);return e;};

/* ── 历制：公历 / 农历（S 始终是公历，L 是农历视图） ── */
let CAL="solar";
let L={y:1962,m:7,d:15,lp:false};
function luY(){ return LU_IDX[L.y-LU_Y0]; }
function luMonIdx(){
  const Y=luY(); if(!Y) return 0;
  return L.lp ? Y.leap : ((Y.leap&&L.m>Y.leap)?L.m:L.m-1);
}
function luMonDays(){ const Y=luY(), mo=Y&&Y.ms[luMonIdx()]; return mo?mo.d:30; }
function luMonName(j){
  const Y=luY(); if(!Y) return String(j+1);
  if(Y.leap&&j===Y.leap) return "闰"+LU_MN[Y.leap-1];
  return LU_MN[((Y.leap&&j>Y.leap)?j:j+1)-1];
}
function luSetMon(j){
  const Y=luY(); if(!Y) return; const mo=Y.ms[j]; if(!mo) return;
  if(mo.lp){ L.m=Y.leap; L.lp=true; } else { L.m=(Y.leap&&j>Y.leap)?j:j+1; L.lp=false; }
  if(L.d>mo.d) L.d=mo.d;
}
function luClamp(){
  const Y=luY(); if(!Y) return;
  if(L.lp&&Y.leap!==L.m) L.lp=false;
  let mo=Y.ms[luMonIdx()];
  if(!mo){ L.m=1; L.lp=false; mo=Y.ms[luMonIdx()]; }
  if(mo&&L.d>mo.d) L.d=mo.d;
}
function syncL(){ const r=s2l(S.y,S.m,S.d); if(r) L=r; }            /* 公历 → 农历视图 */
function syncS(){ const r=l2s(L.y,L.m,L.d,L.lp); if(r){S.y=r.y;S.m=r.m;S.d=r.d;} }
function idxOf(k){
  if(k==="year")  return ((CAL==="solar")?S.y:L.y)-RI.year.base;
  if(k==="month") return (CAL==="solar") ? S.m-1 : luMonIdx();
  if(k==="day")   return ((CAL==="solar")?S.d:L.d)-1;
  if(k==="hour")  return S.hh;
  return S.mi;
}
function daysInMonth(){ return (CAL==="lunar") ? 30 : (S.y&&S.m ? new Date(S.y,S.m,0).getDate() : 31); }
function maxDay(){ return (CAL==="lunar") ? luMonDays() : (S.y&&S.m ? new Date(S.y,S.m,0).getDate() : 31); }

/* ── 小时环：24 格，每格一个数字 0–23，天色作分组底色 ── */
function drawHour(r0,r1){
  const g=$("#rHour"); RI.hour.g=g;
  while(g.firstChild) g.removeChild(g.firstChild);      /* 半径会变（选中时加粗），按新带重画 */
  const rm=(r0+r1)/2;
  const pal=palette("hour");
  for(let h=0;h<24;h++)
    g.appendChild(el("path",{d:sector(r0,r1,h*15-7.5,h*15+7.5),fill:pal[h],
      stroke:"#FFFDF8","stroke-width":"1"}));
  for(let h=0;h<24;h++){
    const wrap=el("g",{transform:`rotate(${h*15} ${C} ${C})`});
    /* 字色按本格底色取 WCAG 对比度更高的一侧 —— 逐格判定，不再靠一张全局表 */
    const t=el("text",{x:C,y:C-rm,class:"hour-t","data-v":h,fill:inkOn(pal[h])});
    t.textContent=String(h);
    wrap.appendChild(t); g.appendChild(wrap);
  }
}
/* ── 分钟环：60 格，每格一块底色，每 5 分标一个数 ── */
function drawMin(r0,r1){
  const g=$("#rMin"); RI.min.g=g;
  while(g.firstChild) g.removeChild(g.firstChild);      /* 半径会变（选中时加粗），按新带重画 */
  const rm=(r0+r1)/2;
  const pal=palette("min");
  /* 原来是「一圈淡灰 + 刻度线」，现在与其余四环同一套语言：每格各自成块 */
  for(let i=0;i<60;i++)
    g.appendChild(el("path",{d:sector(r0,r1,i*6-3-.06,i*6+3+.06),fill:pal[i]}));
  for(let i=0;i<60;i++){
    const major=i%5===0, zero=i===0;
    let w=el("g",{transform:`rotate(${i*6} ${C} ${C})`});
    w.appendChild(el("line",{x1:C,y1:C-r1+1.6,x2:C,y2:C-(r1-(major?10:5)),class:"min-l",
      "stroke-width":zero?2:(major?1.2:.6),opacity:zero?1:(major?.85:.42)}));
    g.appendChild(w);
    if(major){
      w=el("g",{transform:`rotate(${i*6} ${C} ${C})`});
      const t=el("text",{x:C,y:C-(r0+(r1-r0)*0.44),class:"min-t","data-v":i,fill:inkOn(pal[i])});
      t.textContent=String(i);
      w.appendChild(t); g.appendChild(w);
    }
  }
}
function sector(r0,r1,a0,a1){
  /* 统一以 12 点方向为 0°（顺时针），与刻度 wrap 的 rotate(k*step) 同基准 */
  const p=(r,a)=>[C+r*Math.cos((a-90)*Math.PI/180), C+r*Math.sin((a-90)*Math.PI/180)];
  const A=p(r1,a0),B=p(r1,a1),D=p(r0,a1),E=p(r0,a0);
  return `M${A[0]},${A[1]} A${r1},${r1} 0 0 1 ${B[0]},${B[1]} L${D[0]},${D[1]} A${r0},${r0} 0 0 0 ${E[0]},${E[1]} Z`;
}

/* ── 五环共用一套绘制骨架：逐格上色 ──
   统一约定：色块一律「以数字为几何中心」排布（小时环本来就是居中，
   年月两环原来把块从数字起画，数字就压在块的交界上，所以对不上）。
   年环例外：它只有十年刻度的数字、读法是刻度尺，故色块取「数字为首端」。 */
function drawRing(k,r0,r1){
  const R=RI[k]; R.cur=[r0,r1];
  if(k==="hour") return drawHour(r0,r1);
  if(k==="min")  return drawMin(r0,r1);
  const g=$("#"+RINGID[k]);
  R.g=g;
  while(g.firstChild) g.removeChild(g.firstChild);
  const rm=(r0+r1)/2;
  const fill=i=>palette(k)[i];                 /* 逐格一色，来自 palette() */
  /* 以数字角度为中心的一块；两端各外扩 .06° 免得相邻块之间露出发丝缝 */
  const cellC=(i)=>g.appendChild(el("path",{
    d:sector(r0,r1,i*R.step-R.step/2-.06,i*R.step+R.step/2+.06),fill:fill(i)}));
  /* 数字落在块的首端（十年刻度尺的读法） */
  const cellS=(i)=>g.appendChild(el("path",{
    d:sector(r0,r1,i*R.step-.06,(i+1)*R.step+.06),fill:fill(i)}));
  const labelAt=(i,txt,big)=>{
    const wrap=el("g",{transform:`rotate(${i*R.step} ${C} ${C})`});
    const t=el("text",{x:C,y:C-rm,class:"tick-t"+(big?" big":""),"data-v":i,
      fill:inkOn(fill(i))});                       /* 字色跟着本格色块走 */
    t.textContent=txt; wrap.appendChild(t); g.appendChild(wrap);
    return t;
  };
  if(k==="year"){
    for(let i=0;i<R.count;i++) cellS(i);                  /* 逐格一色，十年边界自带深档 */
    for(let i=0;i<R.count;i++){ const y=R.base+i; if(y%10===0&&y!==2010) labelAt(i,String(y),false); }
  }else if(k==="month"){
    for(let i=0;i<R.count;i++) cellC(i);
    for(let i=0;i<R.count;i++){
      /* 分界竖线落在块的边界（数字左右各半格），与色块同基准 */
      const wrap=el("g",{transform:`rotate(${i*R.step-R.step/2} ${C} ${C})`});
      wrap.appendChild(el("line",{x1:C,y1:C-r1+1,x2:C,y2:C-r0-1,class:"tick-l","stroke-width":.7,opacity:.45}));
      g.appendChild(wrap); labelAt(i,(CAL==="lunar")?luMonName(i):String(i+1),true);
    }
  }else{
    for(let i=0;i<R.count;i++) cellC(i);                  /* 日环原来完全无底色，现在逐格成块 */
    for(let i=0;i<R.count;i++){
      const wrap=el("g",{transform:`rotate(${i*R.step} ${C} ${C})`});
      const major=(i+1)%5===0;
      wrap.appendChild(el("line",{x1:C,y1:C-r1+1,x2:C,y2:C-r0-1,class:"tick-l",
        "stroke-width":major?1.2:.7,opacity:major?.8:.42}));
      g.appendChild(wrap);
      /* 31 天全部标数；字号统一收到 10.6px，两字农历名才排得开 */
      labelAt(i,(CAL==="lunar")?LU_DN[i]:String(i+1),false);
    }
  }
}
/* ── 选中环略加粗：内胀外扩，中线几乎不动（读数不跳），邻环淡到 .15 读作浮起。
      原先每侧扩 7，带厚到未选中的 1.5 倍，手机上看起来像两圈宽。
      现每侧只扩 3（约 +20%），外沿最多压进邻环 3，盘沿 / 中心印仍钳位。 ── */
const DISK_R=208;
const FOCUS_PAD=3;
function focusRadii(r0,r1){
  return [Math.max(R_YEAR[0], r0-FOCUS_PAD), Math.min(DISK_R-1, r1+FOCUS_PAD)];
}
const FOCUS={
  year: focusRadii(R_YEAR[0], R_YEAR[1]),
  month:focusRadii(R_MON[0],  R_MON[1]),
  day:  focusRadii(R_DAY[0],  R_DAY[1]),
  hour: focusRadii(R_HOUR[0], R_HOUR[1]),
  min:  focusRadii(R_MIN[0],  R_MIN[1]),
};
function redraw(k){ const R=RI[k], v=R.foc?FOCUS[k]:R.r; drawRing(k,v[0],v[1]); }
function buildRing(k){ redraw(k); }              /* 原名保留，供 rebuild / 初始化调用 */
function orderRings(){                            /* 复位到「由内而外」的基准层序 */
  const box=$("#rings");
  ["min","hour","day","month","year"].forEach(k=>box.appendChild(RI[k].g));
}
function setRingFocus(k,on){
  const R=RI[k];
  R.foc=!!on;
  R.seq=(R.seq||0)+1;      /* 令牌：若在 560ms 收尾前又重新拨动本环，旧回调自动作废 */
  redraw(k);
  R.edge.setAttribute("r",String(R.cur[1]));
  if(on) $("#rings").appendChild(R.g); else orderRings();
  render(k);
}
["year","month","day","hour","min"].forEach(k=>{ RI[k].cur=RI[k].r.slice(); RI[k].foc=false; });
["year","month","day","hour","min"].forEach(buildRing);

/* ── 每环一枚外缘朱砂描边，拨动时点亮，并随环带加粗一起外移 ── */
["year","month","day","hour","min"].forEach(k=>{
  const R=RI[k];
  R.edge=el("circle",{cx:C,cy:C,r:R.r[1],class:"ring-edge"});
  $("#ringEdgeBox").appendChild(R.edge);
});
/* 跨格脉冲：被托起的那枚读数弹一下 + 轻震动 */
const PVID={year:"pvY",month:"pvM",day:"pvD",hour:"pvH",min:"pvI"};
function pulse(k){
  const e=$("#"+PVID[k]);
  if(!e) return;
  e.classList.remove("pulsing"); void e.getBoundingClientRect(); e.classList.add("pulsing");
  try{ if(navigator.vibrate) navigator.vibrate(6); }catch(_){}
}

/* ── 渲染 ── */
/* 刻度是否落进托起窗：同一半径上，浮层的半角 = asin(半宽 / 半径)。
   窗内的刻度一律隐去，改由放大读数承担，避免与读数叠字。 */
function inPillar(R,v){
  const rm=(R.cur[0]+R.cur[1])/2;                 /* 用当前（可能已加粗的）带中线 */
  const half=Math.asin(Math.min(.999,HLW/rm))*180/Math.PI;
  const a=((v*R.step+R.th)%360+540)%360-180;      /* 归一到 -180..180，0 = 12 点 */
  return Math.abs(a)<half;
}
/* 刻度保持正向：绕「字自己的 (x,y)」反转，抵消 wrap 的扇区角 + 整环 CSS 转角。
   不能用 CSS transform-box:fill-box —— WebKit/Android 对 SVG <text> 的 fill-box
   原点经常算成 0,0 或乱 bbox，窄屏上数字会飞出环带。SVG rotate(a,x,y) 走用户坐标。 */
function uprightTick(t,R){
  const v=+t.getAttribute("data-v");
  const x=+t.getAttribute("x"), y=+t.getAttribute("y");
  t.style.removeProperty("transform");           /* 清掉旧 CSS，避免压过 SVG 属性 */
  t.setAttribute("transform",`rotate(${-(R.th+v*R.step)}, ${x}, ${y})`);
  t.classList.toggle("sel",inPillar(R,v));
}
function render(k){
  const R=RI[k];
  R.g.style.transform=`rotate(${R.th}deg)`;
  if(k==="year"||k==="month"||k==="day"){
    R.g.querySelectorAll(".tick-t").forEach(t=>uprightTick(t,R));
  }else if(k==="hour"){
    R.g.querySelectorAll(".hour-t").forEach(t=>{
      uprightTick(t,R);
      t.removeAttribute("opacity");              /* 字色已按本格对比度选定，不再整体压暗 */
    });
  }else{
    R.g.querySelectorAll(".min-t").forEach(t=>uprightTick(t,R));
  }
  paintReadout();
}
function renderAll(){["year","month","day","hour","min"].forEach(render);}

function syncTheta(k,animate){
  const R=RI[k], target=-idxOf(k)*R.step;
  const base=target;
  R.th = base + 360*Math.round((R.th-base)/360);
  const g=R.g, tf=`rotate(${R.th}deg)`;
  if(animate){ g.classList.add("snapping"); requestAnimationFrame(()=>{g.style.transform=tf;}); }
  else { g.classList.remove("snapping"); g.style.transform=tf; }
  render(k);
  if(animate) setTimeout(()=>g.classList.remove("snapping"),460);
}

/* ── 读数区 ── */
/* 浮层里的大字读数：数值 + 紧跟一个小一号的单位（年/月/日/时/分） */
const PVU={pvY:"年",pvM:"月",pvD:"日",pvH:"时",pvI:"分"};
function setPV(id,val){
  const e=$("#"+id); if(!e) return;
  e.textContent="";
  const a=el("tspan",{}); a.textContent=val; e.appendChild(a);
  const b=el("tspan",{class:"u",dx:"1.5"}); b.textContent=PVU[id]; e.appendChild(b);
}
function paintReadout(){
  const LUN=(CAL==="lunar");
  $("#roY").textContent = LUN?L.y:S.y;
  $("#roM").textContent = LUN?((L.lp?"闰":"")+LU_MN[L.m-1]):S.m;
  $("#roD").textContent = LUN?LU_DN[L.d-1]:S.d;
  $("#roS").textContent = pad2(S.hh)+":"+pad2(S.mi);
  $("#roMi").textContent = S.mi+" 分";
  /* 浮层里的放大读数，与读数区同源 */
  setPV("pvY",LUN?L.y:S.y);
  setPV("pvM",LUN?L.m:S.m);
  setPV("pvD",LUN?L.d:S.d);
  setPV("pvH",pad2(S.hh));
  setPV("pvI",pad2(S.mi));
  /* 年份位数多时略微收窄，连同单位也仍落在浮层内 */
  $("#pvY").setAttribute("font-size", String(LUN?L.y:S.y).length>4?17:19);
  const max=maxDay();
  RI.day.g.querySelectorAll(".tick-t").forEach(t=>{
    t.classList.toggle("dim",(+t.getAttribute("data-v")+1)>max);
  });
  fitReadout();
}

/* ── 读数整行等比缩放 ──
   时与分同行后整行变宽，窄屏放不下。整行按内容自然宽生成，再等比缩到容器内：
   transform 不影响布局尺寸，故用 offsetWidth/offsetHeight 读自然宽高，
   缩放后把外层高度收成「自然高 × k」，不留空档。                     */
let fitKey="";
function fitReadout(force){
  const host=$("#readoutFit"), row=$("#readout");
  if(!host||!row) return;
  const avail=host.clientWidth;
  const key=["roY","roM","roD","roS","roMi"].map(i=>$("#"+i).textContent).join("|")+"@"+avail;
  if(!force&&key===fitKey) return;          /* 内容与可用宽都没变就免测，省掉强制重排 */
  fitKey=key;
  const nat=row.offsetWidth, nh=row.offsetHeight;
  if(!nat||!avail) return;
  const k=Math.min(1,avail/nat);
  row.style.transform="scale("+k.toFixed(4)+")";
  row.style.marginLeft=Math.max(0,(avail-nat*k)/2).toFixed(1)+"px";  /* origin 在左上，缩完再居中 */
  host.style.height=(nh*k).toFixed(1)+"px";
}
const onWinResize=()=>fitReadout(true); window.addEventListener("resize",onWinResize);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>fitReadout(true));

/* ── 拨盘：整盘统一监听，按触点半径就近取环 ──
   视觉环带 26–28 宽保持精致，但手指容错 ±23（有效触摸宽约 46），
   落在两环之间也能归到最近的一环，不再需要精确戳中。            */
function dialGeom(e){
  const r=$("#dialSvg").getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2, sc=420/r.width;
  return {rad:Math.hypot(e.clientX-cx,e.clientY-cy)*sc,
          ang:Math.atan2(e.clientX-cx,-(e.clientY-cy))*180/Math.PI}; /* 12 点为 0，顺时针 */
}
function ringAt(e){
  const g=dialGeom(e);
  if(g.rad<SEAL_R||g.rad>210) return null;        /* 中心印与盘外不响应 */
  let best=null,bd=1e9;
  ["year","month","day","hour","min"].forEach(k=>{
    const R=RI[k], d=Math.abs(g.rad-(R.r[0]+R.r[1])/2);
    if(d<bd){bd=d;best=k;}
  });
  return best;
}
const dialEl=$(".dial");
let act=null;
function focusRing(k,on){
  const R=RI[k];
  R.g.classList.toggle("on",on); R.edge.classList.toggle("on",on);
  const ro=$("#"+RINGRO[k]); if(ro) ro.classList.toggle("on",on);
}
dialEl.addEventListener("pointerdown",e=>{
  const k=ringAt(e); if(!k||act) return;
  const R=RI[k];
  act={k:k,last:dialGeom(e).ang,lastV:idxOf(k),x0:e.clientX,y0:e.clientY,moved:0};
  R.g.classList.remove("snapping");
  dialEl.classList.add("focus");
  focusRing(k,true);
  setRingFocus(k,true);                 /* 带加粗 + 抬高层级，一次性做完 */
  try{ dialEl.setPointerCapture(e.pointerId); }catch(_){}
  try{ if(navigator.vibrate) navigator.vibrate(10); }catch(_){}
  e.preventDefault();
});
dialEl.addEventListener("pointermove",e=>{
  if(!act) return;
  const R=RI[act.k], g=dialGeom(e);
  act.moved=Math.max(act.moved,Math.hypot(e.clientX-act.x0,e.clientY-act.y0));
  let d=g.ang-act.last;
  if(d>180)d-=360; if(d<-180)d+=360;
  R.th+=d; act.last=g.ang;
  let v=Math.round(-R.th/R.step); v=((v%R.count)+R.count)%R.count;
  if(v!==act.lastV){ act.lastV=v; pulse(act.k); }
  applyValue(act.k,v);
  R.g.style.transform=`rotate(${R.th}deg)`;
  render(act.k);
});
function endDrag(e){
  if(!act) return;
  const k=act.k, R=RI[k];
  if(act.moved<6){                       /* 轻点：把触点直接转到指针处 */
    R.th-=dialGeom(e).ang;
    let v=Math.round(-R.th/R.step); v=((v%R.count)+R.count)%R.count;
    applyValue(k,v); pulse(k);           /* 先落值，否则会被吸附按旧值拉回 */
  }
  act=null;
  syncTheta(k,true);                                     /* 吸附带回弹 */
  const seq=RI[k].seq;                                   /* 记下本轮令牌 */
  setTimeout(()=>{
    if(RI[k].seq!==seq) return;                           /* 期间又拨了本环：交给新一轮收尾，别把它收回 */
    setRingFocus(k,false);                                 /* 回弹动画走完再收回带厚与层级 */
    dialEl.classList.remove("focus"); focusRing(k,false);
  },560);
}
dialEl.addEventListener("pointerup",endDrag);
dialEl.addEventListener("pointercancel",endDrag);

/* 把环上的索引写回状态（月份变更时顺带收拢日期） */
function applyValue(k,v){
  if(k==="year"){
    if(CAL==="solar"){ S.y=RI.year.base+v; syncL(); }
    else { L.y=RI.year.base+v; luClamp(); retune(); syncS(); }
  }else if(k==="month"){
    if(CAL==="solar"){ S.m=v+1; const mx=maxDay(); if(S.d>mx){S.d=mx; syncTheta("day",false);} syncL(); }
    else { luSetMon(v); syncS(); }
  }else if(k==="day"){
    if(CAL==="solar"){ S.d=Math.min(v+1,maxDay()); syncL(); }
    else { L.d=Math.min(v+1,luMonDays()); syncS(); }
  }else if(k==="hour"){ S.hh=v; }
  else { S.mi=v; }
}
/* 农历年换了，闰月可能变 → 月环格数与标签重建（redraw 会保留当前选中时的加粗半径） */
function rebuild(k){ redraw(k); syncTheta(k,false); }
function retune(){
  if(CAL!=="lunar") return;
  const Y=luY();
  RI.month.count = Y ? 12+(Y.leap?1:0) : 12;
  RI.month.step  = 360/RI.month.count;
  rebuild("month"); rebuild("day");
}
function setCal(c){
  if(c===CAL) return;
  CAL=c;
  root.querySelectorAll('.cal[data-cal]').forEach(x=>{
    const on=x.getAttribute("data-cal")===c;
    x.classList.toggle("on",on); x.setAttribute("aria-pressed",on?"true":"false");
  });
  if(c==="lunar") syncL();
  const Y=luY();
  RI.month.count=(c==="lunar"&&Y)?12+(Y.leap?1:0):12; RI.month.step=360/RI.month.count;
  RI.day.count=(c==="lunar")?30:31;                    RI.day.step=360/RI.day.count;
  rebuild("month"); rebuild("day");
  ["year","month","day"].forEach(k=>syncTheta(k,false));
  paintReadout();
}
root.querySelectorAll('.cal[data-cal]').forEach(b=>
  b.addEventListener("click",()=>setCal(b.getAttribute("data-cal"))));

/* ── 性别：可选，不预选；再点一次可取消 ── */
function paintSex(){
  root.querySelectorAll(".sx").forEach(b=>{
    const on=(S.sex===b.getAttribute("data-sex"));
    b.classList.toggle("on",on);
    b.setAttribute("aria-pressed",on?"true":"false");
  });
}
root.querySelectorAll(".sx").forEach(b=>b.addEventListener("click",()=>{
  const v=b.getAttribute("data-sex");
  S.sex=(S.sex===v)?null:v;
  paintSex();
}));

/* ── ± 微调 ── */
root.querySelectorAll(".mini").forEach(b=>{
  b.addEventListener("click",()=>{
    const k=b.getAttribute("data-k"), d=+b.getAttribute("data-d");
    const R=RI[k];
    let v=idxOf(k)+d;
    v=((v%R.count)+R.count)%R.count;
    applyValue(k,v);
    ["year","month","day","hour","min"].forEach(x=>syncTheta(x,x===k));
  });
});

/* ══════════════════════════════════════════════
   三、语音
   ══════════════════════════════════════════════ */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const seal=$("#seal"), live=$("#live"), liveTx=$("#liveTx"), liveSt=$("#liveSt");
function sealHTML(svg,s1,s3){
  seal.innerHTML=svg+ (s1?`<div class="s1">${s1}</div>`:"") + (s3?`<div class="s3">${s3}</div>`:"");
}
const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>';
let rec=null,recording=false,lastTranscript="",speechApplied=false;
if(SR){
  rec=new SR(); rec.lang="zh-CN"; rec.interimResults=true; rec.continuous=true; rec.maxAlternatives=1;
  rec.onresult=e=>{
    let text="";
    for(let i=0;i<e.results.length;i++) text+=e.results[i][0].transcript;
    lastTranscript=text;
    liveTx.textContent=text||"…";
  };
  rec.onerror=e=>{
    if(e.error==="aborted"||e.error==="no-speech") return;
    recording=false; seal.classList.remove("listening"); sealHTML(MIC,"","");
    live.hidden=false; liveSt.textContent="未识别";
    liveTx.textContent = (e.error==="not-allowed") ? "未获麦克风授权，可用罗盘拨选。" : "未能识别，请再说一次，或拨动罗盘。";
    setTimeout(()=>{ if(!recording) live.hidden=true; },4200);
  };
  rec.onend=()=>{
    const was=recording;
    recording=false; seal.classList.remove("listening"); sealHTML(MIC,"","");
    if(was) commitSpeech();
  };
}
function startRec(){
  if(!SR){ live.hidden=false; liveSt.textContent="此浏览器不支持语音";
    liveTx.textContent="可用罗盘拨选。"; return; }
  lastTranscript=""; speechApplied=false;
  recording=true; seal.classList.add("listening");
  live.hidden=false; liveSt.textContent="聆听中"; liveTx.textContent="";
  sealHTML(MIC,"聆听…","");
  try{ rec.start(); }catch(err){
    recording=false; seal.classList.remove("listening"); sealHTML(MIC,"","");
    liveSt.textContent="未识别";
    liveTx.textContent="麦克风正忙，请再点一次中央印章。";
  }
}
function stopRec(){
  recording=false; seal.classList.remove("listening");
  sealHTML(MIC,"","");
  try{ rec && rec.stop(); }catch(_){}
  commitSpeech();
}
function commitSpeech(){
  const t=(lastTranscript||"").trim();
  if(speechApplied) return;
  if(!t){
    live.hidden=false;
    liveSt.textContent="未听清";
    liveTx.textContent="请再说一次年月日时和城市，或拨动罗盘。";
    setTimeout(()=>{ if(!recording) live.hidden=true; },3500);
    return;
  }
  speechApplied=true;
  handle(t);
}
function handle(t){
  lastTranscript=t;
  const o=parseSpeech(t);
  let miss=[];
  if(o.y){S.y=o.y;} else miss.push("年");
  if(o.m){S.m=o.m;} else miss.push("月");
  if(o.d){S.d=o.d;} else miss.push("日");
  if(o.hh!==null){ S.hh=o.hh; S.mi=o.mi||0; } else miss.push("时");
  if(o.sex){ S.sex=o.sex; paintSex(); }
  const mx=maxDay(); if(S.d>mx) S.d=mx;
  syncL();
  ["year","month","day","hour","min"].forEach(x=>syncTheta(x,true));
  live.hidden=false;
  liveSt.textContent="已记下";
  const hm=pad2(S.hh)+":"+pad2(S.mi);
  const heard=t.replace(/[<>&]/g,"");
  liveTx.innerHTML=miss.length? `${S.y} 年 ${S.m} 月 ${S.d} 日　${hm}<br><span style="color:#A8433A">${miss.join(" · ")} 未辨，可拨盘补正</span><br><span style="opacity:.7">听到：${heard}</span>`
                             : `${S.y} 年 ${S.m} 月 ${S.d} 日　${hm}<br><span style="opacity:.7">听到：${heard}</span>`;
  if(hooks && typeof hooks.onTranscript==="function") hooks.onTranscript(t);
  setTimeout(()=>{ if(!recording) live.hidden=true; },6000);
}
seal.addEventListener("pointerdown",e=>{ e.stopPropagation(); });
seal.addEventListener("click",e=>{
  e.stopPropagation();
  recording?stopRec():startRec();
});
seal.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();recording?stopRec():startRec();} });

/* 结果屏由 React LuopanResult 渲染，不再使用原型 paipan。 */
function getState(){
  return {
    y:S.y, m:S.m, d:S.d, hh:S.hh, mi:S.mi,
    sex:S.sex, calendar:CAL,
    lunarYear:L.y, lunarMonth:L.m, lunarDay:L.d, lunarLeap:!!L.lp
  };
}
const goBtn=$("#btnGo");
if(goBtn) goBtn.onclick=()=>{
  const n=maxDay();
  if(!S.y||!S.m||!S.d||S.d>n){ alert("日期还没选对，看一下罗盘上的读数。"); return; }
  if (hooks && typeof hooks.onGo === "function") hooks.onGo(getState());
};

/* ── 初始 ── */
syncL();
["year","month","day","hour","min"].forEach(k=>{ RI[k].th=-idxOf(k)*RI[k].step; render(k); });

/* ── 入场：五环依次轻摆并「胀一下」，把「拨动 + 选中会加粗」这件事演给人看 ──
   摆幅按各环步长缩放（≤ 半格），摆动期间误触也不会跳到隔壁格。 */
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  setTimeout(()=>{
    ["min","hour","day","month","year"].forEach((k,i)=>{
      setTimeout(()=>{
        const R=RI[k];
        R.g.classList.add("snapping");
        R.th += (i%2?-1:1)*Math.min(8,R.step*0.28);   /* 只改变转角，不改变读数 */
        setRingFocus(k,true);
        R.g.style.transform=`rotate(${R.th}deg)`;
        setTimeout(()=>{ setRingFocus(k,false); syncTheta(k,true); },240);
      }, i*170);
    });
  },700);
}

  try {
    const say = new URLSearchParams(window.location.search).get("say");
    if (say) setTimeout(() => handle(say), 500);
  } catch (_) {}

  return {
    getState,
    applyTranscript: handle,
    destroy() {
      window.removeEventListener("resize", onWinResize);
      recording=false;
      try { rec && rec.abort && rec.abort(); } catch (_) {}
    }
  };
}
