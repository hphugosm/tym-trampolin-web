import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: ["vscode"],
  outfile: "dist/extension.js"
});

if (watch) {
  await ctx.watch();
  console.log("[vibecoder extension] watching...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("[vibecoder extension] build complete");
}
