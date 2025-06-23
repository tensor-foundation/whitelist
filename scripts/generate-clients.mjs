#!/usr/bin/env zx
import "zx/globals";
import * as c from "codama";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@codama/renderers-js";
import { renderVisitor as renderRustVisitor } from "@codama/renderers-rust";
import { getAllProgramIdls } from "./utils.mjs";

// Instanciate codama.
const [idl, ...additionalIdls] = getAllProgramIdls().map((idl) =>
  rootNodeFromAnchor(require(idl)),
);
const codama = c.createFromRoot(idl, additionalIdls);

// Update programs.
codama.update(
  c.updateProgramsVisitor({
    whitelistProgram: {
      name: "tensorWhitelist",
    },
  }),
);

// rm mintProofV1 / whitelistV1 accounts from rendering
codama.update(
  c.deleteNodesVisitor([
    "[accountNode]mintProof",
    "[accountNode]whitelist",
  ]),
);

// Update accounts.
codama.update(
  c.updateAccountsVisitor({
    mintProofV2: {
      size: 945,
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "mint_proof_v2"),
        c.variablePdaSeedNode(
          "mint",
          c.publicKeyTypeNode(),
          "The address of the mint account",
        ),
        c.variablePdaSeedNode(
          "whitelist",
          c.publicKeyTypeNode(),
          "The address of the whitelist pda",
        ),
      ],
    },
    whitelistV2: {
      size: 239,
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "whitelist"),
        c.variablePdaSeedNode(
          "namespace",
          c.publicKeyTypeNode(),
          "The namespace address",
        ),
        c.variablePdaSeedNode(
          "uuid",
          c.fixedSizeTypeNode(c.bytesTypeNode(), 32),
          "UUID of the whitelist",
        ),
      ],
    },
    authority: {
      size: 137,
      seeds: [],
    },
  }),
);

// Set default values for instruction accounts.
codama.update(
  c.setInstructionAccountDefaultValuesVisitor([
    {
      account: "mintProof",
      ignoreIfOptional: true,
      defaultValue: c.pdaValueNode("mintProofV2"),
    },
    {
      account: "whitelist",
      ignoreIfOptional: true,
      defaultValue: c.pdaValueNode("whitelistV2"),
    },
    {
      account: "whitelistAuthority",
      defaultValue: c.pdaValueNode("authority"),
    },
  ]),
);

// Remove WhitelistType and MintProofType from tree so clients don't render it.
codama.update(
  c.deleteNodesVisitor([
    "[definedTypeNode]whitelistType",
    "[definedTypeNode]mintProofType",
  ]),
);

// Debug print the tree.
// codama.accept(c.consoleLogVisitor(c.getDebugStringVisitor({ indent: true })));

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
codama.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json")),
  }),
);

// Render Rust.
const rustClient = path.join(__dirname, "..", "clients", "rust");
codama.accept(
  renderRustVisitor(path.join(rustClient, "src", "generated"), {
    formatCode: true,
    crateFolder: rustClient,
  }),
);
