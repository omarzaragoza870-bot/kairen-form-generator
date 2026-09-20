const bwipjs = require("bwip-js");

const ALLOWED_PROFILES = new Set(["CO","AZ","IN","AK"]);

function clean(v){
  return String(v ?? "").replace(/\|/g, "/").replace(/\r?\n/g," ").trim();
}

module.exports = async (req,res) => {
  if(req.method !== "POST"){
    res.statusCode = 405;
    res.setHeader("Allow","POST");
    return res.end("POST only");
  }

  try{
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const profile = clean(body.profile).toUpperCase();
    if(!ALLOWED_PROFILES.has(profile)){
      res.statusCode=400;
      return res.end("Perfil no soportado.");
    }

    const fields = body.fields || {};
    const pairs = [
      ["MODE","TEST_FORM_V2"],
      ["PROFILE",profile],
      ["VERSION",clean(body.version)],
      ["SUBFILE",clean(body.subfile)]
    ];

    Object.keys(fields).sort().forEach(k => pairs.push([k, clean(fields[k])]));
    const text = pairs.map(([k,v]) => `${k}=${v}`).join("|");

    const png = await bwipjs.toBuffer({
      bcid:"pdf417",
      text,
      scale:3,
      columns:10,
      rowmult:2,
      includetext:false,
      paddingwidth:8,
      paddingheight:8,
      backgroundcolor:"FFFFFF"
    });

    res.statusCode=200;
    res.setHeader("Content-Type","image/png");
    res.setHeader("Cache-Control","no-store");
    return res.end(png);

  }catch(err){
    res.statusCode=500;
    return res.end("Error generando PDF417 de prueba: "+err.message);
  }
};
