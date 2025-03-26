import fs from "fs";
import path from "path";

function readFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return rawContent;
}

function getFiles() {
  console.log(path);
  // return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

export { readFile, getFiles };
