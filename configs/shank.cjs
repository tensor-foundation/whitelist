const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "anchor",
  programName: "whitelist_program",
  programId: "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "whitelist"),
});
