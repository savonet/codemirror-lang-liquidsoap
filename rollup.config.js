import shebang from "rollup-plugin-preserve-shebang";
import typescript from "rollup-plugin-ts";
import { lezer } from "@lezer/generator/rollup";

export default {
  input: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  external: (id) => id != "tslib" && !/^(\.?\/|\w:)/.test(id),
  output: [{ dir: "./dist", format: "es" }],
  plugins: [shebang(), lezer(), typescript()],
};
