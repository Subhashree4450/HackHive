const fs = require('fs');
const xml2js = require('xml2js');

const parseXSD = async (filePath) => {
  const xsdData = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xsdData);
  return result;
};

module.exports = { parseXSD };
