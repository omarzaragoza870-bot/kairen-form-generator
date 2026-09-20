const bwipjs=require("bwip-js");
const profiles=new Set(["CO","AZ","IN","AK"]);
const clean=v=>String(v??"").replace(/\|/g,"/").trim();
module.exports=async(req,res)=>{
  if(req.method!=="POST"){res.statusCode=405;return res.end("POST only")}
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body):(req.body||{});
    const profile=clean(body.profile).toUpperCase(),d=body.data||{};
    if(!profiles.has(profile)){res.statusCode=400;return res.end("Perfil no soportado")}
    const pairs=[["MODE","TEST_FORM_V1"],["PROFILE",profile],["FIRST",d.firstName],["MIDDLE",d.middleName],["LAST",d.lastName],["FOLIO",d.dln],["DOB",d.dob],["ISS",d.iss],["EXP",d.exp],["SEX",d.sex],["HEIGHT_FT",d.heightFt],["HEIGHT_IN",d.heightIn],["EYE",d.eye],["DD",d.dd],["INVENTORY",d.inventory],["STREET",d.street],["CITY",d.city],["STATE",d.addressState],["ZIP",d.zip]];
    const text=pairs.map(([k,v])=>`${k}=${clean(v)}`).join("|");
    const png=await bwipjs.toBuffer({bcid:"pdf417",text,scale:3,columns:6,includetext:false,paddingwidth:8,paddingheight:8,backgroundcolor:"FFFFFF"});
    res.statusCode=200;res.setHeader("Content-Type","image/png");res.setHeader("Cache-Control","no-store");return res.end(png);
  }catch(e){res.statusCode=500;return res.end("Error generando PDF417 de prueba: "+e.message)}
};
