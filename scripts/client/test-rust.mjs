#!/usr/bin/env zx
import "zx/globals";
import { workingDirectory } from "../utils.mjs";

// Run the tests.
cd(path.join(workingDirectory, "clients", "rust"));
const hasSolfmt = await which("solfmt", { nothrow: true });
if (hasSolfmt) {
  await $`BPF_OUT_DIR='../../target/deploy' cargo test-sbf ${argv._} 2>&1 | solfmt`;
} else {
  await $`BPF_OUT_DIR='../../target/deploy' cargo test-sbf ${argv._}`;
}
