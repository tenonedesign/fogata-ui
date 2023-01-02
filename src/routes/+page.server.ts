
// this file runs on server only, so it contains code not suitable for +page.ts since the runs on server and client
import fs from "fs";

export async function load({ params }) {
  return {
    contractWasmBase64: fs.readFileSync("src/lib/fogata.wasm").toString("base64"),
    contractWasmBase64Harbinger: fs.readFileSync("src/lib/fogata-harbinger.wasm").toString("base64"),
  };
}