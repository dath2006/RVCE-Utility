const fs = require("fs");
const folderHierarchy = require("./folderHierarchy.json");

function demo() {
  fs.writeFileSync("folderString.json", JSON.stringify(folderHierarchy));
}

demo();
