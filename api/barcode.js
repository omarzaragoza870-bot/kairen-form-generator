const bwipjs = require("bwip-js");
const sharp = require("sharp");

function clean(v) {
  return String(v == null ? "" : v).replace(/[\r\n|]/g, " ").trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("POST only");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const profile = clean(body.profile).toUpperCase();
    if (profile !== "AK") throw new Error("El barcode automatico esta habilitado para Alaska (AK).");

    // Alaska: el dato codificado es el mismo INVENTORY visible en Photoshop.
    // Aceptamos inventory directo o fields.DCK para mantener compatibilidad futura.
    const inventory = clean(body.inventory || (body.fields && body.fields.DCK)).toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!inventory) throw new Error("Falta INVENTORY.");
    if (!/^1000\d{7}$/.test(inventory)) {
      throw new Error("INVENTORY debe tener 11 digitos y comenzar con 1000. Ejemplo: 10001234567");
    }

    const source = await bwipjs.toBuffer({
      bcid: "code128",
      text: inventory,
      scale: 4,
      height: 18,
      includetext: false,
      textxalign: "center",
      textsize: 11,
      paddingwidth: 8,
      paddingheight: 8,
      backgroundcolor: "FFFFFF"
    });

    const png = await sharp(source)
      .resize({
        width: 900,
        height: 260,
        fit: "contain",
        kernel: "nearest",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Kairen-Barcode", "CODE128");
    res.setHeader("X-Kairen-Profile", "AK");
    return res.end(png);
  } catch (err) {
    res.statusCode = 400;
    return res.end("Error generando BARCODE: " + err.message);
  }
};
