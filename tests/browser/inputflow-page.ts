import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page, Route } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const moduleRoots = new Map([
  ["/packages/core/dist/", resolve(repoRoot, "packages/core/dist")],
  ["/packages/browser/dist/", resolve(repoRoot, "packages/browser/dist")]
]);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

export const installInputFlowPageRoutes = async (page: Page): Promise<void> => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/" || url.pathname === "/keyboard-smoke.html") {
      await route.fulfill({
        status: 200,
        contentType: contentTypes.get(".html"),
        body: keyboardSmokeHtml
      });
      return;
    }

    const filePath = resolveModulePath(url.pathname);
    if (!filePath) {
      await route.fulfill({ status: 404, body: "Not found" });
      return;
    }

    await fulfillFile(route, filePath);
  });
};

const resolveModulePath = (pathname: string): string | undefined => {
  for (const [prefix, root] of moduleRoots) {
    if (!pathname.startsWith(prefix)) {
      continue;
    }

    const relativePath = pathname.slice(prefix.length);
    const filePath = resolve(root, relativePath);
    if (filePath === root || filePath.startsWith(`${root}${sep}`)) {
      return filePath;
    }
  }

  return undefined;
};

const fulfillFile = async (route: Route, filePath: string): Promise<void> => {
  try {
    await route.fulfill({
      status: 200,
      contentType: contentTypes.get(extname(filePath)) ?? "text/plain; charset=utf-8",
      body: await readFile(filePath)
    });
  } catch {
    await route.fulfill({ status: 404, body: "Not found" });
  }
};

const keyboardSmokeHtml = String.raw`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script type="importmap">
      {
        "imports": {
          "@inputflow/core": "/packages/core/dist/index.js",
          "@inputflow/browser": "/packages/browser/dist/index.js"
        }
      }
    </script>
  </head>
  <body>
    <button id="target" type="button">keyboard target</button>
    <script type="module">
      import { createInputFlow } from "@inputflow/core";
      import { createKeyboardSource } from "@inputflow/browser";

      const input = createInputFlow({
        maps: [
          {
            actions: [{ id: "browser.interact", valueType: "button" }],
            bindings: [
              {
                id: "browser.interact.keyboard",
                action: "browser.interact",
                source: { kind: "control", path: "<Keyboard>/code/KeyE" }
              }
            ]
          }
        ]
      });

      input.addSource(createKeyboardSource({ target: window, blurTarget: window }));

      window.inputFlowKeyboardSmoke = {
        read(timeMs = performance.now()) {
          input.update(timeMs);
          return input.readButton("browser.interact");
        },
        dispose() {
          input.dispose();
        }
      };
      document.body.dataset.inputflowReady = "true";
    </script>
  </body>
</html>
`;
