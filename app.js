const $ = id => document.getElementById(id);
const profiles = window.KAIREN_PROFILES;

const SECTIONS = [
  {
    id:"identity", name:"Identity", desc:"Names, date of birth, sex, and name truncation indicators.",
    fields:[
      {code:"DCS",name:"Customer Family Name",type:"text",required:true},
      {code:"DAC",name:"Customer First Name",type:"text",required:true},
      {code:"DAD",name:"Customer Middle Name",type:"text",required:false},
      {code:"DBB",name:"Date of Birth",type:"text",required:true,quick:["18 yrs ago","21 yrs ago","40 yrs ago"]},
      {code:"DBC",name:"Sex",type:"choice",required:true,choices:[["1","Male"],["2","Female"],["9","Not specified"]]},
      {code:"DDE",name:"Family Name Truncation",type:"choice",required:true,choices:[["T","Truncated"],["N","Not truncated"],["U","Unknown"]],default:"N"},
      {code:"DDF",name:"First Name Truncation",type:"choice",required:true,choices:[["T","Truncated"],["N","Not truncated"],["U","Unknown"]],default:"N"},
      {code:"DDG",name:"Middle Name Truncation",type:"choice",required:true,choices:[["T","Truncated"],["N","Not truncated"],["U","Unknown"]],default:"N"},
      {code:"DCU",name:"Name Suffix",type:"text",required:false,quick:["JR","SR","I","II","III","IV","V"]}
    ]
  },
  {
    id:"address", name:"Address", desc:"Mailing address used on the form.",
    fields:[
      {code:"DAG",name:"Address Street",type:"text",required:true},
      {code:"DAH",name:"Address Line 2",type:"text",required:false},
      {code:"DAI",name:"City",type:"text",required:true},
      {code:"DAJ",name:"Jurisdiction Code",type:"text",required:true,default:"CO",readonly:true,helper:"Set from the selected jurisdiction."},
      {code:"DAK",name:"Postal Code",type:"text",required:true}
    ]
  },
  {
    id:"physical", name:"Physical Description", desc:"Height, weight, eye and hair color.",
    fields:[
      {code:"DAY",name:"Eye Color",type:"choice",required:true,choices:[["BLK","Black"],["BLU","Blue"],["BRO","Brown"],["GRY","Gray"],["GRN","Green"],["HAZ","Hazel"],["MAR","Maroon"],["PNK","Pink"],["DIC","Dichromatic"],["UNK","Unknown"]]},
      {code:"DAU",name:"Height",type:"text",required:true,quick:["5'0\"","5'2\"","5'4\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'4\""]},
      {code:"DAW",name:"Weight (pounds)",type:"text",required:false,quick:["110 lb","130 lb","150 lb","160 lb","170 lb","180 lb","190 lb","200 lb","220 lb","250 lb"]},
      {code:"DAZ",name:"Hair Color",type:"choice",required:false,choices:[["","Omit"],["BAL","Bald"],["BLK","Black"],["BLN","Blond"],["BRO","Brown"],["GRY","Gray"],["RED","Red/Auburn"],["SDY","Sandy"],["WHI","White"],["UNK","Unknown"]]}
    ]
  },
  {
    id:"license", name:"License Details", desc:"Document numbers, dates, country, compliance and indicator fields.",
    fields:[
      {code:"DBA",name:"Expiration Date",type:"text",required:true,quick:["+4 yrs","+5 yrs"]},
      {code:"DBD",name:"Document Issue Date",type:"text",required:true,quick:["Today"]},
      {code:"DAQ",name:"Customer ID Number",type:"text",required:true,generate:true},
      {code:"DCF",name:"Document Discriminator",type:"text",required:true,generate:true},
      {code:"DCG",name:"Country Identification",type:"choice",required:true,choices:[["USA","United States"],["CAN","Canada"],["MEX","Mexico"]],default:"USA"},
      {code:"DCK",name:"Inventory Control Number",type:"text",required:false},
      {code:"DDA",name:"REAL ID / Compliance Type",type:"choice",required:false,choices:[["","Omit"],["F","REAL ID"],["N","Federal limits apply"]]},
      {code:"DDB",name:"Card Revision Date",type:"text",required:false,generate:true},
      {code:"DDK",name:"Organ Donor Indicator",type:"choice",required:false,choices:[["","Omit"],["1","Donor"],["0","Not a donor"]]},
      {code:"DDL",name:"Veteran Indicator",type:"choice",required:false,choices:[["","Omit"],["1","Veteran"],["0","Not a veteran"]]},
      {code:"DDD",name:"Limited Duration Document Indicator",type:"choice",required:false,choices:[["","Omit"],["1","Limited duration"],["0","Not limited duration"]]}
    ]
  },
  {
    id:"privileges", name:"Driving Privileges", desc:"Vehicle class, restrictions, and endorsements.",
    fields:[
      {code:"DCA",name:"Vehicle Class",type:"text",required:true,quick:["A CDL combo","B CDL heavy","R regular","M motorcycle","NONE"]},
      {code:"DCB",name:"Restriction Codes",type:"text",required:true,quick:["NONE","B lenses","C mechanical","D prosthetic","E automatic","F outside mirror","G daylight","H employment","I limited other","J other","K intrastate","L no air brake","M no Class A bus","N no A/B bus","O no tractor-trailer","P no CMV passengers","T interlock","V medical variance","W farm waiver","X no tank cargo","Z no full air"]},
      {code:"DCD",name:"Endorsement Codes",type:"text",required:true,quick:["NONE","H hazmat","N tank","P passenger","S school","T doubles","X tank+hazmat"]}
    ]
  }
];

let activeSection = 0;
let values = {};
let lastUrl = null;
let lastBlob = null;

function initProfiles(){
  Object.values(profiles).forEach(p=>{
    const o=document.createElement("option");
    o.value=p.id;o.textContent=p.name;$("profile").appendChild(o);
  });
  $("profile").value="CO";
  updateProfile();
}

function updateProfile(){
  const p=profiles[$("profile").value];
  $("version").value=p.version;
  $("subfile").value=p.subfile;
  $("stateNotice").textContent=p.ready
    ? "CO profile loaded. Colorado fields enabled."
    : p.note;
  const daj = values.DAJ;
  values.DAJ=p.id;
  render();
}

function buildNav(){
  const nav=$("sectionNav"); nav.innerHTML="";
  SECTIONS.forEach((s,i)=>{
    const required=s.fields.filter(f=>f.required);
    const filled=required.filter(f=>String(values[f.code]??f.default??"").trim()!=="").length;
    const div=document.createElement("div");
    div.className="nav-item"+(i===activeSection?" active":"");
    div.innerHTML=`<div class="nav-num">${i+1}</div><div><div class="nav-name">${s.name}</div><div class="nav-sub">${filled} of ${required.length} filled</div></div>`;
    div.onclick=()=>{activeSection=i;render()};
    nav.appendChild(div);
  });
}

function makeField(f){
  const wrap=document.createElement("div");
  wrap.className="field";
  wrap.dataset.label=(f.code+" "+f.name).toLowerCase();
  wrap.dataset.required=f.required?"1":"0";

  const label=document.createElement("div");
  label.className="label-row";
  label.innerHTML=`<span class="code">${f.code}</span><span>${f.name}</span>${f.required?'<span class="req">*</span>':'<span class="optional">optional</span>'}`;
  wrap.appendChild(label);

  if(f.type==="choice"){
    const q=document.createElement("div");q.className="quick";
    f.choices.forEach(([val,txt])=>{
      const b=document.createElement("button");
      b.type="button";b.className="chip";
      const current=String(values[f.code]??f.default??"");
      if(current===val)b.classList.add("active");
      b.textContent=(val?val+" ":"")+txt;
      b.onclick=()=>{values[f.code]=val;render()};
      q.appendChild(b);
    });
    wrap.appendChild(q);
  } else {
    const input=document.createElement("input");
    input.className="text-input"+(!f.required?" optional-input":"");
    input.type="text";
    input.value=values[f.code]??f.default??"";
    if(f.readonly) input.readOnly=true;
    input.oninput=e=>{values[f.code]=e.target.value;updateProgressOnly()};
    if(f.generate){
      const row=document.createElement("div");row.className="inline-suffix";
      row.appendChild(input);
      const g=document.createElement("button");g.type="button";g.textContent="Generate";
      g.onclick=()=>{values[f.code]=generateField(f.code);render()};
      row.appendChild(g);wrap.appendChild(row);
    }else{
      wrap.appendChild(input);
    }
  }

  if(f.quick && f.type!=="choice"){
    const q=document.createElement("div");q.className="quick";
    f.quick.forEach(txt=>{
      const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=txt;
      b.onclick=()=>applyQuick(f.code,txt);
      q.appendChild(b);
    });
    wrap.appendChild(q);
  }
  if(f.helper){const h=document.createElement("div");h.className="helper";h.textContent=f.helper;wrap.appendChild(h)}
  return wrap;
}

function render(){
  buildNav();
  const s=SECTIONS[activeSection];
  $("sectionKicker").textContent=`SECTION ${activeSection+1} OF ${SECTIONS.length}`;
  $("sectionTitle").textContent=s.name;
  $("sectionDescription").textContent=s.desc;
  const area=$("formArea");area.innerHTML="";
  const grid=document.createElement("div");grid.className="field-grid";
  s.fields.forEach(f=>grid.appendChild(makeField(f)));
  area.appendChild(grid);
  applyFilters();
  updateProgressOnly();
}

function updateProgressOnly(){
  buildNav();
  const s=SECTIONS[activeSection];
  const req=s.fields.filter(f=>f.required);
  const filled=req.filter(f=>String(values[f.code]??f.default??"").trim()!=="").length;
  $("progressText").textContent=`${filled}/${req.length} required`;
  $("fieldCount").textContent=`${s.fields.length} fields`;
  $("progressBar").style.width=(req.length?filled/req.length*100:0)+"%";
}

function applyFilters(){
  const q=$("search").value.trim().toLowerCase();
  const reqOnly=$("requiredOnly").checked;
  document.querySelectorAll(".field").forEach(el=>{
    const match=(!q||el.dataset.label.includes(q)) && (!reqOnly||el.dataset.required==="1");
    el.classList.toggle("hidden-filter",!match);
  });
}

function applyQuick(code,txt){
  const now=new Date();
  const fmt=d=>String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/"+d.getFullYear();
  if(txt==="Today") values[code]=fmt(now);
  else if(txt.includes("yrs ago")){const y=parseInt(txt);const d=new Date(now);d.setFullYear(now.getFullYear()-y);values[code]=fmt(d)}
  else if(txt.startsWith("+")){const y=parseInt(txt);const d=new Date(now);d.setFullYear(now.getFullYear()+y);values[code]=fmt(d)}
  else values[code]=txt.split(" ")[0]==="NONE"?"NONE":txt.split(" ")[0];
  render();
}

function generateField(code){
  if(code==="DAQ") return "FORM-"+Math.floor(100000+Math.random()*900000);
  if(code==="DCF") return "TEST"+Date.now().toString().slice(-10);
  if(code==="DDB"){
    const d=new Date();return String(d.getMonth()+1).padStart(2,"0")+"/"+String(d.getDate()).padStart(2,"0")+"/"+d.getFullYear();
  }
  return "AUTO"+Math.floor(100000+Math.random()*900000);
}

function autoFields(){
  ["DAQ","DCF","DDB"].forEach(c=>values[c]=generateField(c));
  if(!values.DDE)values.DDE="N";
  if(!values.DDF)values.DDF="N";
  if(!values.DDG)values.DDG="N";
  if(!values.DCG)values.DCG="USA";
  render();
}

function autofill(){
  values={
    DCS:"SULLIVAN",DAC:"JOURDAN",DAD:"ELIZA",DBB:"09/22/1992",DBC:"2",DDE:"N",DDF:"N",DDG:"N",DCU:"",
    DAG:"20662 DUKE",DAH:"",DAI:"AURORA",DAJ:$("profile").value,DAK:"80013",
    DAY:"BRO",DAU:"5'7\"",DAW:"",DAZ:"",
    DBA:"02/13/2032",DBD:"02/13/2024",DAQ:"FORM-000123",DCF:"TESTDD001",DCG:"USA",DCK:"C0004884992",
    DDA:"",DDB:"",DDK:"",DDL:"",DDD:"",
    DCA:"R",DCB:"NONE",DCD:"NONE"
  };
  render();
}

function nextRequired(){
  for(let si=activeSection;si<SECTIONS.length;si++){
    const f=SECTIONS[si].fields.find(x=>x.required && !String(values[x.code]??x.default??"").trim());
    if(f){activeSection=si;render();setTimeout(()=>{const el=[...document.querySelectorAll(".field")].find(e=>e.dataset.label.startsWith(f.code.toLowerCase()));el?.querySelector("input")?.focus();},0);return}
  }
  alert("Todos los campos requeridos están llenos.");
}

function collect(){
  const out={profile:$("profile").value,version:$("version").value,subfile:$("subfile").value,strict:$("strict").checked,mode:"TEST_FORM_V2",fields:{}};
  SECTIONS.forEach(s=>s.fields.forEach(f=>out.fields[f.code]=String(values[f.code]??f.default??"")));
  return out;
}

function validate(){
  if(!$("strict").checked)return;
  for(const s of SECTIONS){
    for(const f of s.fields){
      if(f.required && !String(values[f.code]??f.default??"").trim()){
        activeSection=SECTIONS.indexOf(s);render();throw new Error(`Falta ${f.code} ${f.name}`);
      }
    }
  }
}

async function generateBarcode(){
  try{
    validate();
    $("generate").disabled=true;$("generate").textContent="Generando...";
    const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(collect())});
    if(!r.ok) throw new Error(await r.text());
    lastBlob=await r.blob();
    if(lastUrl)URL.revokeObjectURL(lastUrl);
    lastUrl=URL.createObjectURL(lastBlob);
    $("preview").innerHTML=`<img src="${lastUrl}" alt="PDF417 de prueba">`;
    $("download").disabled=false;
    $("previewModal").classList.remove("hidden");
  }catch(e){alert(e.message)}
  finally{$("generate").disabled=false;$("generate").textContent="Generar PDF417 de prueba"}
}

async function copyJson(){
  const t=JSON.stringify(collect(),null,2);
  try{await navigator.clipboard.writeText(t)}catch{prompt("Copia los datos:",t)}
}

function closeModal(){$("previewModal").classList.add("hidden")}

$("profile").onchange=updateProfile;
$("search").oninput=applyFilters;
$("requiredOnly").onchange=applyFilters;
$("nextRequired").onclick=nextRequired;
$("autoFields").onclick=autoFields;
$("autofill").onclick=autofill;
$("generate").onclick=generateBarcode;
$("copyData").onclick=copyJson;
$("closeModal").onclick=closeModal;
$("closeModal2").onclick=closeModal;
$("download").onclick=()=>{if(!lastUrl)return;const a=document.createElement("a");a.href=lastUrl;a.download=`kairen_${$("profile").value}_test_pdf417.png`;a.click()};
window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("search").focus()}});

initProfiles();render();
