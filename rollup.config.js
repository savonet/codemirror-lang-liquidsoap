import shebang from "rollup-plugin-preserve-shebang";
import typescript from "@rollup/plugin-typescript";
import sourcemaps from "rollup-plugin-sourcemaps";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";
import { lezer } from "@lezer/generator/rollup";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        sourcemap: "inline",
        file: "dist/index.js",
        format: "es",
      },
    ],
    plugins: [
      lezer(),
      typescript({
        sourceMap: true,
        inlineSources: true,
        tsconfig: "./tsconfig.json",
      }),
      sourcemaps(),
    ],
  },
  {
    input: "src/cli.ts",
    output: [
      {
        sourcemap: "inline",
        file: "dist/cli.js",
        format: "es",
      },
    ],
    plugins: [
      shebang(),
      lezer(),
      typescript({
        sourceMap: true,
        inlineSources: true,
        tsconfig: "./tsconfig.json",
      }),
      sourcemaps(),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [
      {
        file: "dist/index.d.ts",
        format: "es",
        plugins: [],
      },
    ],
    plugins: [dts(), del({ targets: "dist/types", hook: "buildEnd" })],
  },
];
