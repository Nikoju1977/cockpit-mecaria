'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),a=html.indexOf('const avg=a=>'),b=html.indexOf('const iprOf=',a);
assert.ok(a>=0&&b>a,'Missing production source');
const context={db:{meta:{targets:{grr:10}}}};
vm.createContext(context);
vm.runInContext(html.slice(a,b)+'\nObject.assign(globalThis,{strictMetric,oeeCalc,oeeAgg,spcCompute,msaCompute,msaCalc});',context,{timeout:1000});
const {strictMetric,oeeCalc,oeeAgg,spcCompute,msaCompute,msaCalc}=context;
let checks=0;
function eq(a,b){assert.equal(a,b);checks++}
function near(a,b){assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),a+' != '+b);checks++}
const row=(opening,stops,cycle,produced,good)=>({opening,stops,cycle,produced,good});
for(const x of ['',null,true,'2 min','1e-400','-1e-400','Infinity','1,2,3'])eq(strictMetric(x),null);
near(strictMetric('2,5e1'),25);
let c=oeeCalc(row(480,60,60,400,380));near(c.D,420/480);near(c.P,400/420);near(c.Q,.95);near(c.trs,380/480);
for(const r of [row(0,0,60,0,0),row(1,-1,60,0,0),row(1,2,60,0,0),row(1,0,0,0,0),row(1,0,1,1.5,1),row(1,0,1,1,2),row(1,1,1e-300,1,1),row(1,0,1e-323,1,1),row(1,0,61,1,1)])eq(!!oeeCalc(r).err,true);
eq(oeeCalc(row(1,1,60,0,0)).trs,0);
eq(oeeCalc(row(1,1,60,0,0)).P,null);
for(let opening=1;opening<=20;opening++)for(let stops=0;stops<=opening;stops++)for(let produced=0;produced<=opening-stops;produced++){
 const good=Math.floor(produced*.8),x=oeeCalc(row(opening,stops,60,produced,good));
 near(x.trs,good/opening);near(x.D,(opening-stops)/opening);
 if(produced>0)near(x.D*x.P*x.Q,x.trs);
}
c=oeeAgg([row(10,2,60,6,5),row(20,0,120,8,7)]);
near(c.D,28/30);near(c.P,22/28);near(c.Q,19/22);near(c.trs,19/30);
eq(oeeAgg([row(1,0,60,1,1),row(0,0,60,0,0)]),null);
const group=Array.from({length:20},(_,i)=>[9+(i%2)*.2,11+(i%2)*.2]);
const spc=(g,n=2,lsl=6,usl=14)=>spcCompute({n,lsl,usl,data:g.map(x=>x.join(' ')).join('\n')});
c=spc(group);eq(c.eligible,true);near(c.mean,10.1);near(c.RCL,2);near(c.UCL,10.1+1.880*2);near(c.LCL,10.1-1.880*2);near(c.RUCL,3.267*2);near(c.sw,2/1.128);near(c.cp,8/(6*(2/1.128)));near(c.cpk,3.9/(3*(2/1.128)));
const flat=group.flat(),sd=Math.sqrt(flat.reduce((s,x)=>s+(x-10.1)**2,0)/39);near(c.pp,8/(6*sd));near(c.ppk,3.9/(3*sd));
eq(spc(group.slice(0,19)).cpk,null);eq(spc(group,2,14,6).err!==undefined,true);
eq(spc(group,2,'bad',14).err!==undefined,true);eq(spc([[1,2],[3]],2).err!==undefined,true);
eq(spc(group,2.5).err!==undefined,true);eq(spc([[1,1],[1,1]]).eligible,false);
c=spc([...group,[100,102]]);eq(c.eligible,false);eq(c.cpk,null);eq(c.signals.R1.includes(21),true);
const seven=Array.from({length:20},(_,i)=>[0,1,2,3,4,5,6].map(x=>x+(i%2)*.1));seven[7]=Array(7).fill(3);c=spc(seven,7,-10,20);eq(c.signals.R5.includes(8),true);
c=spc([[0],[2],[0],[2]],1,-10,10);near(c.RCL,2);near(c.sw,2/1.128);near(c.UCL,1+2.66*2);eq(c.cpk,null);
const grid=Array.from({length:2},(_,o)=>Array.from({length:10},(_,p)=>[p*10+o*.2-.5,p*10+o*.2+.5]));
const study={ops:'2',parts:'1e1',trials:'2',grid:JSON.stringify(grid),tol:100,opNames:'A,B'};
c=msaCompute(study);eq(c.filled,40);eq(c.total,40);near(c.RR,1);near(c.Xdiff,.2);near(c.EV,.8862);near(c.AV,0);near(c.GRR,.8862);near(c.PV,90*.3146);near(c.TV,Math.hypot(.8862,90*.3146));near(c.pTol,6*.8862);eq(c.ndc,Math.floor(1.41*90*.3146/.8862));eq(c.verdict,'Acceptable');
eq(msaCalc(study).verdict,'Acceptable');context.db.meta.targets.grr=1;eq(msaCalc(study).verdict,'Sous conditions');context.db.meta.targets.grr=31;eq(!!msaCalc(study).err,true);context.db.meta.targets.grr=10;
eq(!!msaCompute({...study,parts:2}).err,true);eq(!!msaCompute({...study,tol:0}).err,true);
const zero=Array.from({length:2},()=>Array.from({length:10},(_,p)=>[p,p]));
eq(msaCompute({...study,grid:JSON.stringify(zero)}).verdict,'Données insuffisantes');
const incomplete=JSON.parse(study.grid);incomplete[0][0][0]=null;eq(msaCompute({...study,grid:JSON.stringify(incomplete)}).filled,39);
console.log('MECARIA PRODUCTION FUNCTIONS PASS: '+checks+' assertions; TRS, weighted aggregation, SPC Xbar-R / I-MR, capability, R&R and cache.');
