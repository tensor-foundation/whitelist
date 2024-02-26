const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "whitelist", "idl");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..");

generateIdl({
  generator: "anchor",
  programName: "whitelist_program",
  programId: "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "whitelist"),
});
