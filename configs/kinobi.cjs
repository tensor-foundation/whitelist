const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "whitelist_program.json")]);

// Update programs.
kinobi.update(
  k.updateProgramsVisitor({
    whitelistProgram: {
      name: "tensorWhitelist",
    },
  })
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    mintProof: {
      size: 28,
      seeds: [
        k.constantPdaSeedNodeFromString("mint_proof"),
        k.variablePdaSeedNode(
          "mint",
          k.publicKeyTypeNode(),
          "The address of the mint account"
        ),
        k.variablePdaSeedNode(
          "whiltelist",
          k.publicKeyTypeNode(),
          "The address of the whitelist pda"
        ),
      ],
    },
    whitelist: {
      size: 238,
      seeds: [
        k.variablePdaSeedNode(
          "uuid",
          k.bytesTypeNode(k.fixedSizeNode(32)),
          "UUID of the whitelist"
        ),
      ],
    },
    authority: {
      size: 137,
      seeds: [],
    },
  })
);

// Set default values for instruction accounts.
kinobi.update(
  k.setInstructionAccountDefaultValuesVisitor([
    {
      account: "mintProof",
      ignoreIfOptional: true,
      defaultValue: k.pdaValueNode("mintProof"),
    },
    {
      account: "whitelist",
      ignoreIfOptional: true,
      defaultValue: k.pdaValueNode("whitelist"),
    },
    {
      account: "whitelistAuthority",
      defaultValue: k.pdaValueNode("authority"),
    },
  ])
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(k.renderJavaScriptExperimentalVisitor(jsDir, { prettier }));

// Render Rust.
const crateDir = path.join(clientDir, "rust");
const rustDir = path.join(clientDir, "rust", "src", "generated");
kinobi.accept(
  k.renderRustVisitor(rustDir, {
    formatCode: true,
    crateFolder: crateDir,
    renderParentInstructions: true,
  })
);