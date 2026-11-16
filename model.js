(function(root){
 'use strict';
 const alleles={
 lac:{wt:'Wild type',null:'lacI− · no functional repressor',super:'lacIˢ · superrepressor',cis:'Oᶜ · repressor cannot bind',prom:'P− · inactive promoter',enzyme:'lacZ− · inactive β-galactosidase'},
 trp:{wt:'Wild type',null:'trpR− · no functional repressor',cis:'Oᶜ · repressor cannot bind',prom:'P− · inactive promoter',atten:'Δattenuator · no early termination',enzyme:'trpE− · inactive pathway enzyme'},
 ara:{wt:'Wild type',null:'araC− · no functional regulator',cis:'araI activation-site defect',prom:'P_BAD− · inactive promoter',enzyme:'araA− · inactive isomerase'}
 };
 function simulate(op,env,chrom='wt',plasmid='none'){
   const copies=[chrom,...(plasmid==='none'?[]:[plasmid])];
   const reg=copies.some(a=>a!=='null'&&a!=='super');
   const superR=op==='lac'&&copies.includes('super');
   return copies.map((a,i)=>{
     let level='High',reason='',init='Active',atten='Not applicable';
     if(op==='lac'){
       const blocked=a!=='cis'&&(superR||(reg&&!env.inducer));
       level=blocked?'Off / basal':env.glucose?'Low':'High';
       reason=blocked?(superR?'LacIˢ acts in trans and remains repressive even with inducer.':'Active LacI binds the operator and strongly represses initiation.'):(a==='cis'?'This Oᶜ copy escapes LacI repression in cis. ':!reg?'No functional LacI is present. ':'Inducer relieves LacI repression. ')+(env.glucose?'Glucose keeps CAP–cAMP activation low.':'Low glucose favors CAP–cAMP activation.');
       init=blocked?'Repressed':'Permitted';
     }else if(op==='trp'){
       const blocked=reg&&env.trp&&a!=='cis';
       const terminated=env.trp&&a!=='atten';
       init=blocked?'Repressed':'Permitted';atten=terminated?'3–4 terminator favored':a==='atten'?'Attenuator deleted':'2–3 antiterminator favored';
       level=blocked?'Off / basal':terminated?'Low':'High';
       reason=(blocked?'Tryptophan activates TrpR, reducing initiation. ':'Initiation escapes TrpR repression. ')+(terminated?'For transcripts that initiate, abundant charged tRNAᵀʳᵖ favors leader translation and the 3–4 terminator.':a==='atten'?'Deletion removes attenuation, but does not remove promoter repression.':'Low charged tRNAᵀʳᵖ stalls the leader ribosome, favoring the 2–3 antiterminator and readthrough.');
     }else{
       const active=reg&&env.arabinose&&a!=='cis';
       level=active?(env.glucose?'Low':'High'):'Off / basal';init=active?'Activated':'Not activated';
       reason=!reg?'Without AraC, effective arabinose-dependent activation is lost; deleting a dual regulator does not simply switch expression on.':a==='cis'?'The defective AraC activation site cannot be repaired by a diffusible AraC protein.':!env.arabinose?'Without arabinose, AraC favors a repressive DNA loop.':'Arabinose changes AraC binding, favoring adjacent activation sites. '+(env.glucose?'High glucose limits CAP–cAMP activation.':'Low glucose supports CAP–cAMP activation.');
     }
     if(a==='prom'){level='None';init='Disabled';reason='The promoter is inactive on this DNA copy. A working promoter elsewhere cannot rescue it in trans.';}
     const protein=a==='enzyme'?'No functional product':level==='None'?'None':level;
     if(a==='enzyme')reason+=' This nonpolar coding mutation allows transcription but prevents the modeled enzyme from functioning.';
     return {copy:i?'Plasmid':'Chromosome',allele:a,level,protein,reason,init,atten};
   });
 }
 function validateConstruct(c){const issues=[];if(c.promoter!=='lac')issues.push('Choose a bacterial lac promoter/operator to make transcription LacI-regulated.');if(c.gene!=='cdna')issues.push('Use an intron-free coding sequence for mature hGH; E. coli does not splice human nuclear introns.');if(!c.rbs)issues.push('A bacterial ribosome-binding site is needed for efficient translation initiation.');if(!c.ori)issues.push('Include an E. coli-compatible origin for plasmid replication.');if(!c.marker)issues.push('Include a selectable marker to identify cells carrying the plasmid.');if(!c.terminator)issues.push('Add a downstream terminator to define the transcription unit and reduce readthrough.');if(!c.repressor)issues.push('Supply functional LacI from the host or a separate plasmid cassette for inducible control.');return issues;}
 const api={alleles,simulate,validateConstruct};root.OperonModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
