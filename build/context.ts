import { context } from "esbuild";
import { globby as glob } from "globby";

export default await context({
  entryPoints: await glob("src/*.ts"),
  outdir: "./dist/",
  minify: true,
});
