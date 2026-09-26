import { parseLuopanSpeech } from "./speechParse";

/** 八字罗盘拨盘（从竹简命盘原型抽出，由 React 页挂载） */
export function initLuopan(root, hooks) {
  const $ = (s) => root.querySelector(s);
/* ══════════════════════════════════════════════
   一、历法与排盘内核（已与 lunar-python 对拍 1200 例，零偏差）
   ══════════════════════════════════════════════ */
/* ↓↓↓ 历法内核 ↓↓↓ */
const JQ="07ps14he21k32z523xaz4vyq5uw66tsa7sce8qdh9ntsakt606vl13n820px2yaw3wgs4v4h5u1u6sxv7rhx8piy9mz9ajyn075413wu20zl2ykm3wqg4ve65ubl6t7p7rru8psx9n99ak8m07f2146o219c2yu93x024vnq5ul66thc7s1l8q2r9nj4akig07ot14gd21j02z3x3x9p4vxd5uut6tr07sb98qcg9nstaks406uh13m020on2y9m3wfh4v385u0o6swv7rh48pib9myqajy4074i13w220yn2yji3wp84vct5ua56t687rqf8pro9n87ak7q07e8145u218e2yt63wyt4vmc5ujp6tfv7s058q1f9nhwakhe07nv14fg21i12z2u3x8j4vw55utk6tpr7sa18qb99nrpakr506tm13l820nv2y8r3weg4v1y5tz76sv87rff8pgn9mx3ajwk073213ur20xg2yid3wo24vbm5u8v6t4w7rp48pqd9n6wak6e07cv144g21722yrw3wxl4vl55uih6tek7ryt8q029nglakg407ml14e521gp2z1i3x774vur5us46to77s8e8q9l9nq1akpi06rz13jl20m72y723wct4v0h5txw6su17re98pff9mvuajvb071s13tf20w22ygv3wmi4va15u7c6t3f7rno8pow9n5eak4w07be1430215m2yqe3ww04vjh5ugt6tcz7rxc8pyn9nf5akek07ky14ch21f12yzu3x5k4vt65uqm6tmv7s788q8k9np2akoi06qv13id20kw2y5p3wbe4uyy5tw96ssd7rcn8pdy9mujaju2070j13s220ul2yfc3wkz4v8i5u5v6t207rmc8pnp9n4cak3x07af141y214e2yp13wul4vi35ufi6tbr7rw68pxk9ne7akdt07kb14bv21eb2yyy3x4g4vrw5up86tlf7s5t8q769nnqakn906pr13hd20jy2y4o3wa94uxr5tv36sr97rbn8pd29mtoajt706zq13rc20tx2yen3wk64v7k5u4r6t0u7rl68pml9n3bak2y079i1414213m2yob3wtt4vh65uee6tai7ruv8pwa9ncyakck07j314am21d42yxt3x3f4vqy5uoc6tki7s4v8q689nmuakmf06oy13gj20j12y3r3w9c4uwt5tu26sq57rae8pbp9msaajrv06yg13q320so2yde3wix4v6c5u3m6szr7rk38plg9n23ak1o078613zq21272ymw3wse4vfv5ud76t9g7rtx8pvd9nc0akbk07i0149i21bx2ywl3x244vpk5umv6tj27s3g8q4w9nliakl106nh13ey20hf2y233w7o4uv65tsj6soq7r968pan9mrbajqx06xe13ow20rb2ybw3whc4v4r5u216sy77ril8pk39n0vak0l077613yp21122ylk3wqx4ve85ubh6t7p7rs68pto9naeaka207gl148421aj2yv33x0i4vnw5ul86thi7s218q3k9nk9akjv06me13dx20ge2y103w6g4uts5tqy6sn27r7g8p8y9mpoajpc06vx13ni20q02yan3wg24v3c5u0j6swn7rh18pil9mzeajz4075n13x520zi2yk23wph4vcv5ua56t6e7rqv8psg9n99ak8y07fi146z219c2ytv3wz94vmn5ujx6tg47s0i8q1z9nipakie06ky13ci20ey2xzi3w4y4usc5tpo6slw7r6c8p7t9mokajo706us13md20os2y9c3wep4v205tz96svh7rfy8phj9mybajy1074m13w620yk2yj33woe4vbo5u8v6t547rpn8pr99n82ak7p07e6145n21802ysj3wxy4vlc5uio6tez7rzl8q189ni2akhp06k613bm20dy2xyi3w3x4ura5toi6sko7r558p6q9mnmajnd06ty13lh20nt2y8a3wdl4v0v5ty36su97rer8pgd9mxaajx4073q13v720xh2yhu3wn34vae5u7p6t417ron8pqc9n78ak7007dm1454217f2yru3wx34vkb5uhk6tds7ryb8pzx9ngrakgh06j113am20d02xxi3w2t4uq25tn96sjg7r3z8p5n9mmiajm906su13kd20mr2y783wci4uzp5twu6st07rdk8pf89mw7ajw1072o13u620wh2ygw3wm54v9c5u6h6t2m7rn58pot9n5pak5h07c2143j215t2yq83wvj4viv5ug56tcf7rwz8pym9nfhakf806hs139a20bm2xw23w1d4uon5tlv6si27r2j8p449mkzajkr06rd13ix20la2y5p3wax4uy45tva6sri7rc18pdp9mulajud070x13sd20um2yf03wk84v7g5u4r6t147rlu8pnm9n4kak4b07at1428214g2yos3wu14vh95uei6tas7rvf8px59ne3akdu06gd137s20a02xud3vzm4umu5tk36sgc7r0z8p2r9mjrajjm06q713ho20jv2y453w994uwf5ttn6spx7ral8pce9mthajtg070513rn20tt2ye13wj34v665u3b6szk7rk98pm29n32ak2y079l1413213c2ynm3wsq4vfv5ud26t9e7ru48pvy9ncyakcs06ff136x20982xtl3vys4ulw5tiz6sf67qzr8p1j9milajii06p713gq20j22y3f3w8k4uvn5tso6sot7r9e8pb69msaajs806yv13qc20sj2yct3whz4v555u2c6sym7rjb8pl69n28ak25078s1409212g2ymq3wrw4vf35ucb6t8k7rt58puv9nbuakbp06ec135v20852xsh3vxm4uks5thz6se97qyv8p0l9mhkajhf06o213fl20hu2y243w774uub5tri6snt7r8j8pae9mrgajrc06xy13pf20rn2ybw3wgy4v415u176sxh7ri88pk39n14ak0x077g13yu21102yla3wqe4vdk5uat6t757rrx8ptu9naxakas06db134n206s2xr13vw64ujb5tgi6scs7qxh8ozc9mghajgg06n413ej20go2y0u3w5u4usw5tq06sm97r6y8p8u9mq0ajq006wp13o320q52ya83wf54v265tze6svt7rgo8pin9mztajzs076f13xu20zy2yk33wp14vc25u986t5k7rqb8ps89n9cak9a06bx133f205m2xpt3vut4uht5tev6sb37qvt8oxr9mexajew06ll13d220f72xzc3w4b4ura5toc6skl7r5d8p7d9monajoq06vg13mw20p02y943we24v125ty46sud7rf38ph19my7ajy8074w13wc20yg2yil3wnk4vam5u7s6t437rou8pqr9n7xak7w06ak132120462xod3vtd4ugf5tdk6s9t7quj8owg9mdlajdl06kc13bu20e12xy73w364uq45tn76sjg7r478p659mnbajna06ty13lc20ng2y7k3wci4uzi5twp6st37re08pg39mxbajxa073v13v720x92yhe3wme4v9g5u6o6t307rnu8ppu9n72ak72069o131120342xn83vs74uf85tcd6s8o7qtg8ovh9mcqajcs06ji13aw20cx2xww3w1r4uop5tlu6si77r338p579mmkajmp06th13kx20mx2y6w3wbp4uyl5tvo6ss27rcx8pf09mw9ajwb073013ug20wi2ygj3wle4v8a5u5d6t1q7rmn8poq9n60ak61068p130420282xmc3vr84ue55tb66s7g7qsa8oud9mboajbs06ij13a020c32xw63w114unw5tkw6sh37r1v8p3x9ml9ajle06s313jh20lg2y5g3waa4ux75tub6sqo7rbk8pdo9mv1ajv5071u13t820v72yf73wk24v715u476t0j7rlc8pnd9n4mak4o067e12yv200x2xky3vps4ucp5t9s6s637qqw8osx9ma6aja806gy138f20ag2xuf3vz64um05tj36sfg7r0f8p2l9mjyajk206qs13i620k52y443w8w4uvr5tst6sp77ra58pcb9mtoajtq070c13ro20tm2ydl3wif4v5b5u2e6sys7rjq8plw9n3aak3e066212xd1zzb2xj93vo24uaz5t816s4d7qp98org9m8waj9406fw137b209a2xt63vxw4ukp5thq6se17qyw8p129miiajiq06pi13gw20it2y2n3w7b4uu35tr66snl7r8m8pav9msaajsh06z713qm20sl2ych3wh74v415u146sxi7rih8pkn9n21ak26064x12wd1zye2xie3vn64u9z5t6y6s387qo48oqa9m7paj7w06eo136320822xry3vwn4ujf5tge6scq7qxp8ozz9mhiajhs06ok13fy20hv2y1r3w6g4uta5tqc6smp7r7n8p9u9mraajrh06y813pm20rj2ybf3wg54v305u036swh7rhf8pjl9n0zak15063v12va1zx82xh53vlv4u8o5t5q6s247qn28opa9m6paj6w06do135420742xr03vvp4uih5tfh6sbu7qwt8oz29mgjajgp06ne13eq20gl2y0f3w524uru5tow6sld7r6g8p8t9mqcajqi06x613of20q82ya23wer4v1m5tyq6sv67rg88pij9n01ak09062z12ua1zw52xfz3vkn4u7g5t4h6s0t7qls8oo39m5maj5x06cq1342205v2xpk3vu14ugp5tdq6sa57qv88oxm9mf9ajfm06mg13du20fo2xzd3w3u4uqi5tni6sjy7r528p7f9mozajp806w113nf20pa2y923wdm4v095tx86stl7ren8pgz9mykajyt061k12sy1zuv2xeo3vj94u5w5t2s6rz37qk38omh9m44aj4g06bb132q204n2xog3vt04ufo5tck6s8u7qtt8ow59mdsaje406kx13ca20e32xxt3w2d4up15tm16sie7r3g8p5t9mneajnp06ui13lv20no2y7f3wc04uys5tvu6ss97rda8pfk9mx3ajxc060512rk1zth2xda3vhv4u4l5t1m6rxz7qiz8ola9m2saj31069u131820332xmt3vra4udw5tav6s7b7qsg8oux9mckajcv";
const GAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const GAN_POL=["阳","阴","阳","阴","阳","阴","阳","阴","阳","阴"];
const ZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WX=[0,0,1,1,2,2,3,3,4,4], WXN=["木","火","土","金","水"];
const WXC=["var(--wx-wood)","var(--wx-fire)","var(--wx-earth)","var(--wx-metal)","var(--wx-water)"];
const ZHI_WX=[4,2,0,0,2,1,1,2,3,3,2,4];
const CANG=[[8],[5,8,7],[0,2,4],[1],[4,1,8],[2,6,4],[3,5],[5,3,1],[6,8,4],[7],[4,7,3],[8,0]];
const MZ=[1,2,3,4,5,6,7,8,9,10,11,0];
function jqOf(y){const b=(y-1920)*48,a=[];for(let k=0;k<12;k++)a.push(parseInt(JQ.substr(b+k*4,4),36));return a;}
function doy(y,m,d){return Math.floor((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/86400000)+1;}
function jdn(y,m,d){const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
function shishen(o,me){const wo=WX[me],ox=WX[o],s=(o%2)===(me%2);
  if(ox===wo)return s?"比肩":"劫财"; if(ox===(wo+1)%5)return s?"食神":"伤官";
  if(ox===(wo+2)%5)return s?"偏财":"正财"; if(ox===(wo+3)%5)return s?"七杀":"正官";
  return s?"偏印":"正印";}
function paipan(y,m,d,hh,mi){
  const key=doy(y,m,d)*1440+hh*60+mi,q=jqOf(y);
  const ny=key>=q[1]?y:y-1, yg=(ny-4+10000)%10, yz=(ny-4+12000)%12;
  let mz=0; for(let i=11;i>=0;i--){if(key>=q[i]){mz=MZ[i];break;}}
  const mg=((((yg%5)*2+2)+((mz-2+12)%12))%10+10)%10;
  const dz=(jdn(y,m,d)+49)%60, dg=dz%10, dzh=dz%12;
  const tz=((hh+1)/2|0)%12, tg=((dg%5)*2+tz)%10;
  return {year:{g:yg,z:yz},month:{g:mg,z:mz},day:{g:dg,z:dzh},time:{g:tg,z:tz}};
}
/* ══════ 一天的天色：8 个生活化时段（仅作小时环的分组底色与语音词，不再是选项） ══════ */
const SEG = [
  {n:"半夜",   h:1,  s:"子丑"}, {n:"天快亮", h:4,  s:"寅"},
  {n:"天刚亮", h:6,  s:"卯"},   {n:"上午",   h:9,  s:"辰巳"},
  {n:"中午",   h:12, s:"午"},   {n:"下午",   h:15, s:"未申"},
  {n:"傍晚",   h:18, s:"酉"},   {n:"晚上",   h:21, s:"戌亥"}
];
const pad2=n=>String(n).padStart(2,"0");

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
/* ── 选中环的「加大加粗」：内胀外扩，带厚 +30~50%，中线几乎不动（读数不会跳）。
      外沿最多只压到邻环 4 单位，而邻环此刻已淡到 .15，读作「浮起来」；
      同时把该环抬到最上层，扩出去的部分才不会被邻环盖住。 ── */
/* 选中时的环带半径：内沿外沿各向外扩 7 —— 「加粗」靠它，不是靠整体等比放大。
   等比放大会让最外圈冲破盘沿（206×1.06=218 > 208），而厚度只涨 6%，看不出加粗。
   年环内沿被中心印（半径 58）挡住，只能停在 56；分钟环外沿止于 207（盘沿 208）。 */
const FOCUS={year:[56,91],month:[81,121],day:[113,155],hour:[145,187],min:[177,207]};
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
function render(k){
  const R=RI[k];
  R.g.style.transform=`rotate(${R.th}deg)`;
  if(k==="year"||k==="month"||k==="day"){
    R.g.querySelectorAll(".tick-t").forEach(t=>{
      const v=+t.getAttribute("data-v");
      t.classList.toggle("sel",inPillar(R,v));
      t.style.transform=`rotate(${-(R.th+v*R.step)}deg)`;
    });
  }else if(k==="hour"){
    R.g.querySelectorAll(".hour-t").forEach(t=>{
      const v=+t.getAttribute("data-v");
      t.style.transform=`rotate(${-(R.th+v*R.step)}deg)`;
      t.classList.toggle("sel",inPillar(R,v));
      t.removeAttribute("opacity");              /* 字色已按本格对比度选定，不再整体压暗 */
    });
  }else{
    R.g.querySelectorAll(".min-t").forEach(t=>{
      const v=+t.getAttribute("data-v");
      t.style.transform=`rotate(${-(R.th+v*R.step)}deg)`;
      t.classList.toggle("sel",inPillar(R,v));
    });
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
   三、语音：录音上云端转写+抽取，失败再走浏览器听写与正则
   ══════════════════════════════════════════════ */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const HAS_MEDIA=typeof MediaRecorder!=="undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
const MAX_REC_MS=16000;
const HEARD_HOLD_MS=window.matchMedia("(prefers-reduced-motion: reduce)").matches?400:1600;
const seal=$("#seal"), live=$("#live"), liveTx=$("#liveTx"), liveSt=$("#liveSt"), liveSub=$("#liveSub");
const dialBox=$(".dial");
function sealHTML(svg,s1,s3){
  seal.innerHTML=svg+ (s1?`<div class="s1">${s1}</div>`:"") + (s3?`<div class="s3">${s3}</div>`:"");
}
const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>';
const IDLE_SEAL_LABEL="点一下开始口述生辰，再点一次结束";
let rec=null,recording=false,lastTranscript="",speechApplied=false,commitBusy=false;
let mediaRec=null, mediaStream=null, mediaChunks=[], mediaBlob=null, recTimer=null, usingMedia=false, liveHideTimer=null;
function preferServerStt(){
  return Boolean(hooks && typeof hooks.preferAudio==="function" && hooks.preferAudio());
}
function waitMs(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }
function setLiveMode(mode){
  live.classList.remove("live-listen","live-heard","live-applied");
  if(mode) live.classList.add("live-"+mode);
}
function showLive(mode, title, text, sub){
  if(liveHideTimer){ clearTimeout(liveHideTimer); liveHideTimer=null; }
  live.hidden=false;
  setLiveMode(mode);
  liveSt.textContent=title||"";
  liveTx.textContent=text||"";
  if(liveSub){
    if(sub){ liveSub.hidden=false; liveSub.innerHTML=sub; }
    else { liveSub.hidden=true; liveSub.textContent=""; }
  }
}
function hideLiveLater(ms){
  if(liveHideTimer) clearTimeout(liveHideTimer);
  liveHideTimer=setTimeout(()=>{
    if(!recording) live.hidden=true;
  }, ms);
}
function setListeningChrome(on){
  seal.classList.toggle("listening",on);
  if(dialBox) dialBox.classList.toggle("listening-dial",on);
  seal.setAttribute("aria-label", on ? "正在听，再点一下结束" : IDLE_SEAL_LABEL);
}
function pickRecorderMime(){
  if(typeof MediaRecorder==="undefined" || !MediaRecorder.isTypeSupported) return "";
  const cands=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus"];
  return cands.find(t=>MediaRecorder.isTypeSupported(t))||"";
}
function stopMediaTracks(){
  try{ mediaStream && mediaStream.getTracks().forEach(t=>t.stop()); }catch(_){}
  mediaStream=null;
}
function stopMediaRecorder(){
  return new Promise(resolve=>{
    if(!mediaRec || mediaRec.state==="inactive"){
      stopMediaTracks();
      resolve(mediaBlob);
      return;
    }
    mediaRec.onstop=()=>{
      try{
        mediaBlob=new Blob(mediaChunks,{type:mediaRec.mimeType||"audio/webm"});
      }catch(_){ mediaBlob=null; }
      stopMediaTracks();
      mediaRec=null;
      resolve(mediaBlob);
    };
    try{ mediaRec.stop(); }catch(_){
      stopMediaTracks();
      mediaRec=null;
      resolve(mediaBlob);
    }
  });
}
if(SR){
  rec=new SR(); rec.lang="zh-CN"; rec.interimResults=true; rec.continuous=true; rec.maxAlternatives=1;
  rec.onresult=e=>{
    let text="";
    for(let i=0;i<e.results.length;i++) text+=e.results[i][0].transcript;
    lastTranscript=text;
    if(recording){
      liveTx.textContent=text||"正在听…";
    }
  };
  rec.onerror=e=>{
    if(e.error==="aborted"||e.error==="no-speech") return;
    if(usingMedia) return;
    recording=false; setListeningChrome(false); sealHTML(MIC,"","");
    showLive("","未听清", (e.error==="not-allowed") ? "未获麦克风授权，可用罗盘拨选。" : "未能识别，请再说一次，或拨动罗盘。");
    hideLiveLater(4200);
  };
  rec.onend=()=>{
    if(usingMedia) return;
    const was=recording;
    recording=false; setListeningChrome(false); sealHTML(MIC,"","");
    if(was) commitSpeech();
  };
}
async function startMediaCapture(){
  mediaChunks=[]; mediaBlob=null;
  mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});
  const mime=pickRecorderMime();
  mediaRec=mime ? new MediaRecorder(mediaStream,{mimeType:mime}) : new MediaRecorder(mediaStream);
  mediaRec.ondataavailable=e=>{ if(e.data && e.data.size) mediaChunks.push(e.data); };
  mediaRec.start(250);
}
function beginListeningUi(){
  lastTranscript=""; speechApplied=false; mediaBlob=null; usingMedia=false;
  recording=true; setListeningChrome(true);
  showLive("listen","正在听你说","请口述姓名、生辰、出生城市。说完后再点一次中央印章。");
  sealHTML(MIC,"正在听","再点结束");
  if(recTimer){ clearTimeout(recTimer); recTimer=null; }
  recTimer=setTimeout(()=>{ if(recording) stopRec(); }, MAX_REC_MS);
}
function startWebSpeech(){
  if(!SR || !rec){
    showLive("","此浏览器不支持语音","可用罗盘拨选。");
    recording=false; setListeningChrome(false); sealHTML(MIC,"","");
    return;
  }
  usingMedia=false;
  try{ rec.start(); }catch(err){
    recording=false; setListeningChrome(false); sealHTML(MIC,"","");
    showLive("","未听清","麦克风正忙，请再点一次中央印章。");
  }
}
function startRec(){
  const canAudio=HAS_MEDIA && preferServerStt();
  if(!canAudio && !SR){
    showLive("","此浏览器不支持语音","可用罗盘拨选。");
    return;
  }
  beginListeningUi();
  if(canAudio){
    usingMedia=true;
    startMediaCapture().catch(err=>{
      console.warn("luopan mediarecorder", err);
      usingMedia=false;
      startWebSpeech();
    });
    return;
  }
  startWebSpeech();
}
function stopRec(){
  recording=false; setListeningChrome(false);
  sealHTML(MIC,"","");
  if(recTimer){ clearTimeout(recTimer); recTimer=null; }
  try{ rec && rec.stop(); }catch(_){}
  commitSpeech();
}
async function commitSpeech(){
  if(speechApplied || commitBusy) return;
  commitBusy=true;
  let blob=mediaBlob;
  if(usingMedia){
    try{ blob=await stopMediaRecorder(); }catch(_){ blob=null; }
    usingMedia=false;
  }
  const t=(lastTranscript||"").trim();
  const hasAudio=Boolean(blob && blob.size>=800);
  if(!t && !hasAudio){
    commitBusy=false;
    showLive("","未听清","请再说一次年月日时和城市，或拨动罗盘。");
    hideLiveLater(3500);
    return;
  }
  speechApplied=true;
  if(t) showLive("heard","我们听到了", t);
  else showLive("listen","正在听写","已录音，正在转成文字…");
  const nluPromise = (hooks && typeof hooks.onVoice==="function")
    ? hooks.onVoice({transcript:t, audio:hasAudio?blob:null}).catch(err=>{
        console.warn("luopan onVoice", err);
        return null;
      })
    : Promise.resolve(null);
  const holdPromise = t ? waitMs(HEARD_HOLD_MS) : Promise.resolve();
  let parsed=null;
  try{ parsed=await nluPromise; }catch(_){ parsed=null; }
  let heard=t;
  if(parsed && parsed.raw) heard=String(parsed.raw).trim()||heard;
  if(!heard && parsed) heard=(parsed.raw||"").trim();
  if(!heard && !parsed){
    commitBusy=false;
    speechApplied=false;
    showLive("","未听清","请再说一次年月日时和城市，或拨动罗盘。");
    hideLiveLater(3500);
    return;
  }
  if(heard && heard!==t) showLive("heard","我们听到了", heard);
  await holdPromise;
  if(!t && heard) await waitMs(HEARD_HOLD_MS);
  commitBusy=false;
  if(parsed) applyParsed(parsed, heard);
  else if(heard) handle(heard);
}
function applyParsed(o, heardText){
  const t=(heardText||o.raw||lastTranscript||"").trim();
  lastTranscript=t;
  const hasDate=Boolean(o.y||o.m||o.d);
  if(hasDate && o.lunar){
    setCal("lunar");
    if(o.y) L.y=o.y;
    if(o.m) L.m=o.m;
    if(o.d) L.d=o.d;
    L.lp=!!o.leap;
    luClamp(); retune(); syncS();
  }else if(hasDate){
    if(CAL==="lunar") setCal("solar");
    if(o.y) S.y=o.y;
    if(o.m) S.m=o.m;
    if(o.d) S.d=o.d;
    const mx=maxDay(); if(S.d>mx) S.d=mx;
    syncL();
  }
  if(o.hh!==null && o.hh!==undefined){ S.hh=o.hh; S.mi=o.mi||0; }
  if(o.sex){ S.sex=o.sex; paintSex(); }
  ["year","month","day","hour","min"].forEach(x=>syncTheta(x,true));
  let miss=[];
  if(!o.y) miss.push("年");
  if(!o.m) miss.push("月");
  if(!o.d) miss.push("日");
  if(o.hh===null || o.hh===undefined) miss.push("时");
  const calLabel=o.lunar?"农历":"公历";
  const yShow=o.lunar?L.y:S.y, mShow=o.lunar?((L.lp?"闰":"")+LU_MN[L.m-1]):S.m, dShow=o.lunar?LU_DN[L.d-1]:S.d;
  const hm=pad2(S.hh)+":"+pad2(S.mi);
  const heard=t.replace(/[<>&]/g,"");
  const nameBit=o.name?String(o.name).replace(/[<>&]/g,""):"";
  const cityBit=o.city?String(o.city).replace(/[<>&]/g,""):"";
  const filled=[calLabel, nameBit, `${yShow}年`, `${mShow}${o.lunar?"":"月"}`, dShow, hm, cityBit].filter(Boolean).join("　");
  const missHtml=miss.length? `<span style="color:#A8433A">${miss.join(" · ")} 未辨，可拨盘补正</span>` : "已按这句话填入罗盘，可再核对。";
  showLive("applied","已填入罗盘", heard?`听到：${heard}`:"", `${filled}<br>${missHtml}`);
  if(hooks && typeof hooks.onApply==="function") hooks.onApply(o, t);
  else if(hooks && typeof hooks.onTranscript==="function") hooks.onTranscript(t);
  hideLiveLater(16000);
}
function handle(t){
  applyParsed(parseLuopanSpeech(t), t);
}
seal.addEventListener("pointerdown",e=>{ e.stopPropagation(); });
seal.addEventListener("click",e=>{
  e.stopPropagation();
  recording?stopRec():startRec();
});
seal.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();recording?stopRec():startRec();} });

/* ══════════════════════════════════════════════
   四、竹简命盘
   ══════════════════════════════════════════════ */
const WXNAME=["木","火","土","金","水"];
const WXVAR=["var(--wx-wood)","var(--wx-fire)","var(--wx-earth)","var(--wx-metal)","var(--wx-water)"];
const SSMEAN={
  "比肩":"和我一样的人",
  "劫财":"和我同源、但要分走我东西的人",
  "食神":"我自然产出的东西",
  "伤官":"我带锋芒的产出",
  "偏财":"不固定的收获",
  "正财":"按规矩换来的收获",
  "七杀":"硬来的压力",
  "正官":"讲规矩的压力",
  "偏印":"偏门来的支撑",
  "正印":"正向来的支撑"
};

function showResult(){
  const p=paipan(S.y,S.m,S.d,S.hh,S.mi);
  const shi=ZHI[((S.hh+1)/2|0)%12];
  const dg=p.day.g;
  const pillars=[
    {k:"年柱",g:p.year.g, z:p.year.z},
    {k:"月柱",g:p.month.g,z:p.month.z},
    {k:"日柱",g:p.day.g,  z:p.day.z, day:true},
    {k:"时柱",g:p.time.g, z:p.time.z}
  ];
  /* 五行统计：四天干 + 四地支 */
  const cnt=[0,0,0,0,0];
  pillars.forEach(pl=>{ cnt[WX[pl.g]]++; cnt[ZHI_WX[pl.z]]++; });
  const max=Math.max.apply(null,cnt);

  const bb=pillars.map((pl,i)=>{
    const cg=(CANG[pl.z]||[]).map(x=>GAN[x]).join(" ");
    const ss=shishen(pl.g,dg);
    const zw=ZHI_WX[pl.z];
    return `<div class="bb${pl.day?" day":""}" style="animation-delay:${i*0.13}s">
      <div class="fib"></div>
      <div class="cap">${pl.k}</div>
      <div class="wxlab">${GAN_POL[pl.g]}${WXN[WX[pl.g]]}${pl.day?"（你）":""} / ${WXN[zw]}</div>
      <div class="gan">${GAN[pl.g]}</div>
      <div class="ss">${SSMEAN[ss]||ss}</div>
      <div class="line"></div>
      <div class="zhi">${ZHI[pl.z]}</div>
      <div class="wxtag" style="background:${WXVAR[zw]}"></div>
      <div class="cang">${cg?"内含 "+cg:""}</div>
    </div>`;
  }).join("");

  const inks=cnt.map((n,i)=>{
    const d=Math.round(30+ (n/(max||1))*34);
    const o=(0.30+0.55*(n/(max||1))).toFixed(2);
    return `<div class="ink"><div class="drop" style="--c:${WXVAR[i]};--d:${d}px;--o:${o}"></div>
      <div class="nm">${WXNAME[i]}</div><div class="ct">${n}</div></div>`;
  }).join("");

  const dmWx=WXN[WX[dg]];
  const lr=s2l(S.y,S.m,S.d);
  const lunar = lr ? `农历 ${lr.y} 年 ${lr.lp?"闰":""}${LU_MN[lr.m-1]}月${LU_DN[lr.d-1]}` : "";

  $("#res").innerHTML=`
    <div class="res-top">
      <button class="bk" id="bk" aria-label="返回罗盘"><svg viewBox="0 0 10 17" fill="none" width="10" height="17"><path d="M8.5 1L1.5 8.5L8.5 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <span class="tt">你的命盘</span>
    </div>
    <div class="dm">
      <div class="ring">
        <div class="lb">日 主</div>
        <div class="gz">${GAN[dg]}</div>
        <div class="wx">五行属 ${dmWx}</div>
      </div>
      <div class="cap">${S.y} 年 ${S.m} 月 ${S.d} 日　${pad2(S.hh)}:${pad2(S.mi)}　${shi}时${S.sex?"　"+S.sex:""}<br>${lunar}</div>
    </div>
    <div class="bamboo-hint">自右向左 · 年 月 日 时</div>
    <div class="bamboo-row">${bb}</div>
    <p class="grid-cap">日柱的第一个字是日主，代表你本人；其余七个字描述你出生时的环境。一个地支里通常同时含两到三个五行，分主次——网格上的「内含」就是它装着的那几项。</p>
    <div class="ink-sec">
      <div class="ink-h">五 行</div>
      <div class="ink-row">${inks}</div>
    </div>
    <div class="creed">知结构，不问吉凶</div>
    <div class="fine">
      按立春分岁、十二「节」分月，节气时刻精确到分钟；未取真太阳时。<br>
      本盘只呈现干支结构，不判吉凶，不构成任何医疗、法律、财务或人生决策建议。
    </div>
    <div class="res-foot">
      <button class="b-sec" id="again">重 排</button>
      <button class="b-sec" id="back2">返回罗盘</button>
    </div>`;
  $("#res").hidden=false;
  $("#dialScreen").hidden=true;
  $("#bk").onclick=back; $("#back2").onclick=back; $("#again").onclick=back;
  window.scrollTo({top:0,behavior:"smooth"});
}
function back(){
  $("#res").hidden=true;
  $("#dialScreen").hidden=false;
  window.scrollTo({top:0,behavior:"smooth"});
}
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
  else showResult();
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
    const params = new URLSearchParams(window.location.search);
    if (params.get("listen") === "1" && !params.get("say")) {
      setTimeout(() => beginListeningUi(), 200);
    }
    const say = params.get("say");
    if (say) setTimeout(() => {
      lastTranscript = say;
      speechApplied = false;
      commitSpeech();
    }, 500);
  } catch (_) {}

  return {
    getState,
    applyTranscript: handle,
    applyParsed: (o, heard) => applyParsed(o, heard),
    destroy() {
      window.removeEventListener("resize", onWinResize);
      recording=false;
      commitBusy=false;
      if(recTimer){ clearTimeout(recTimer); recTimer=null; }
      if(liveHideTimer){ clearTimeout(liveHideTimer); liveHideTimer=null; }
      setListeningChrome(false);
      try { rec && rec.abort && rec.abort(); } catch (_) {}
      try { mediaRec && mediaRec.state!=="inactive" && mediaRec.stop(); } catch (_) {}
      stopMediaTracks();
    }
  };
}
