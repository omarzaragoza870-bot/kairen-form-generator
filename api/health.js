module.exports = async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ ok: true, service: "kairen-pdf417-test", version: "0.5.2", output: "900x300" }));
};
