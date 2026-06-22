import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const harnessPath = "/examples/manual-gamepad-harness/index.html";
const port = Number.parseInt(process.env.INPUTFLOW_GAMEPAD_HARNESS_PORT ?? "4173", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const pathname = url.pathname === "/" ? harnessPath : decodeURIComponent(url.pathname);
  const filePath = resolveSafePath(pathname);

  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": contentTypes.get(extname(filePath)) ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}${harnessPath}`;
  console.log(`InputFlow manual Gamepad harness: ${url}`);
  console.log("Press Ctrl+C to stop the local harness server.");
});

server.on("error", (error) => {
  console.error(`Failed to start manual Gamepad harness on port ${port}: ${error.message}`);
  process.exitCode = 1;
});

const resolveSafePath = (pathname) => {
  const normalized = normalize(pathname).replace(/^([/\\])+/, "");
  const filePath = resolve(join(repoRoot, normalized));

  if (filePath !== repoRoot && !filePath.startsWith(`${repoRoot}${sep}`)) {
    return undefined;
  }

  return filePath;
};
