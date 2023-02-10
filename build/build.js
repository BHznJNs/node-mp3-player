import fs from "node:fs"

fs.renameSync("./build/cjs/index.js", "./build/cjs/index.cjs")
fs.renameSync("./build/esm/index.js", "./build/esm/index.mjs")

fs.unlinkSync("./build/cjs/index.d.ts")

fs.renameSync("./build/esm/index.d.ts", "./src/index.d.ts")