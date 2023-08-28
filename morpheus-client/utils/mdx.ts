import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

const ROOT = process.cwd();

export const getCompiledMDX = async (source: string) => {
  if (process.platform === "win32") {
    process.env.ESBUILD_BINARY_PATH = path.join(ROOT, "node_modules", "esbuild", "esbuild.exe");
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(ROOT, "node_modules", "esbuild", "bin", "esbuild");
  }

  const remarkPlugins: any[] = [];
  const rehypePlugins: any[] = [[rehypePrismPlus, { ignoreMissing: true }], rehypeAutolinkHeadings, rehypeSlug];

  try {
    return await bundleMDX({
      source,
      mdxOptions(options) {
        options.remarkPlugins = [...(options.remarkPlugins ?? []), ...remarkPlugins];
        options.rehypePlugins = [...(options.rehypePlugins ?? []), ...rehypePlugins];

        return options;
      },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getMDXFile = async (filename: string) => {
  const docsDirectory = path.join(ROOT, "docs");
  const filePath = path.join(docsDirectory, filename);
  const source = fs.readFileSync(filePath, "utf8");
  const { code, frontmatter } = await getCompiledMDX(source);
  return {
    code,
    frontmatter,
  };
};
