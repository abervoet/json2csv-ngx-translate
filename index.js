const program = require("commander");
const fs = require("fs");
const path = require("path");
const flatten = require("flat");
const os = require("os");

program
  .version("1.0.0", "-v, --version")
  .option("-p, --path [filePath]", "Input file path")
  .parse(process.argv);

function main() {
  const filePath = program.path;

  if (!filePath) {
    console.error("Please specify the input file path with the --path [PATH] argument");
    return;
  }

  if (fs.existsSync(filePath)) {
    console.log("Checking file %s", filePath);

    const fileExt = path.extname(filePath);

    if (fileExt != ".json" && fileExt != ".csv") {
      console.error("Input file %s does not exist", filePath);
      return;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    if (fileExt == ".json") {
      console.log("converting json to csv...");
      jsonToCSV(fileContent);
    } else if (fileExt == ".csv") {
      console.log("converting csv to json...");
      csvToJSON(fileContent);
    }
  }
}

function jsonToCSV(fileContent) {
  const jsonContent = JSON.parse(fileContent);
  const flatJson = flatten.flatten(jsonContent, {
    delimiter: ".",
    safe: false
  });

  const buffer = new Buffer('','utf8');

  Object.keys(flatJson).forEach(key => {
    const value = flatJson[key];
    const line = value.indexOf(",") >= 0 ? `"${value}"` : value;
    buffer.write(`${key}, ${line}${os.EOL}`);
  });

  fs.writeFileSync('output.json', buffer.toString(), {
      encoding: 'utf8'
  });
}

function csvToJSON(fileContent) {
  const flatJson = {};

  fileContent.split(/\r?\n/).forEach(line => {
    const separatorIndex = line.indexOf(",");
    const key = line.substring(0, separatorIndex);
    const value = line.substring(separatorIndex + 2).replace(/^\"+|\"+$/g, "");
    flatJson[key] = value;
  });

  const outJson = flatten.unflatten(flatJson, {
    delimiter: ".",
    object: false,
    overwrite: true
  });

  fs.writeFileSync("output.json", JSON.stringify(outJson), {
    encoding: "utf8"
  });
}

main();
