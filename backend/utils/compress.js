// services/compress.js
const zlib = require("zlib");

function compress(str) {
  return zlib.deflateSync(str).toString("base64");
}

function decompress(str) {
  return zlib.inflateSync(Buffer.from(str, "base64")).toString();
}

module.exports = { compress, decompress };
