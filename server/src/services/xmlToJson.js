const xml2js = require("xml2js");
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

async function xmlToJson(xml) {
  return parser.parseStringPromise(xml);
}

module.exports = { xmlToJson };
