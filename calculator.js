function calculate(v){
const years=v.retire-v.age,n=years*12,duration=(v.end-v.retire)*12;
const pre=v.pre/100,post=v.post/100,inf=v.inflation/100,m=Math.pow(1+pre,1/12)-1;
const expense=v.spend*Math.pow(1+inf,years),income=v.income*Math.pow(1+inf,years),monthlyGap=Math.max(0,expense-income);
const q=Math.pow((1+inf)/(1+post),1/12),annuity=Math.abs(q-1)<1e-9?duration:(1-Math.pow(q,duration))/(1-q);
const target=monthlyGap*annuity*(1+v.buffer/100),fv=Math.abs(m)<1e-9?n:(Math.pow(1+m,n)-1)/m;
const available=v.assets*Math.pow(1+pre,years)+v.saving*fv+v.lump,gap=Math.max(0,target-available),surplus=Math.max(0,available-target);
return {years,expense,monthlyGap,target,available,gap,surplus,coverage:target>0?available/target:null,extra:n>0?gap/fv:null,immediate:gap/Math.pow(1+pre,years)};
}
if(typeof module!=='undefined')module.exports={calculate};
if(typeof document!=='undefined'){
const form=document.getElementById('form'),ids=['age','retire','end','spend','income','assets','saving','lump','pre','post','inflation','buffer'],el=id=>document.getElementById(id),money=n=>'HK$'+Math.round(n).toLocaleString('en-HK');
function update(){const v=Object.fromEntries(ids.map(id=>[id,el(id).value===''?NaN:Number(el(id).value)]));let error='';if(ids.some(id=>!Number.isFinite(v[id])||!el(id).checkValidity()))error='請填寫所有有效數字；年齡需為整數。';else if(v.retire<v.age||v.end<=v.retire)error='退休年齡須不小於現時年齡，計劃年齡須大於退休年齡。';el('error').textContent=error;el('results').hidden=!!error;el('print').disabled=!!error;if(error)return;const r=calculate(v);if(Object.values(r).some(x=>x!==null&&!Number.isFinite(x))){el('error').textContent='數值超出可計算範圍，請調整假設。';el('results').hidden=true;return;}el('gapLabel').textContent=r.gap>0?'預計退休資金缺口':'預計退休資金盈餘';el('gap').textContent=Math.round(r.gap>0?r.gap:r.surplus).toLocaleString('en-HK');el('time').textContent=`${r.years} 年後退休 · 規劃 ${v.end-v.retire} 年退休生活`;for(const [id,key] of [['target','target'],['available','available'],['expense','expense'],['monthlyGap','monthlyGap']])el(id).textContent=money(r[key]);el('coverage').textContent=r.coverage===null?'不適用（無收支缺口）':(r.coverage*100).toFixed(1)+'%';el('bar').style.width=r.coverage===null?'100%':Math.min(100,r.coverage*100)+'%';el('extraLabel').textContent=r.years===0?'已達退休年齡，即時需補足':'由今日開始，每月需額外儲蓄';el('extra').textContent=money(r.years===0?r.gap:r.extra);el('total').textContent=r.years===0?'請按現有資產及退休收入重新檢視。':`每月總儲蓄目標 ${money(v.saving+r.extra)}（包括現時 ${money(v.saving)}）`;}
form.addEventListener('input',update);form.addEventListener('submit',e=>{e.preventDefault();update();if(innerWidth<761)el('results').scrollIntoView({behavior:'smooth',block:'start'});});form.addEventListener('reset',()=>setTimeout(update,0));el('print').addEventListener('click',()=>window.print());update();}
