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

    if (url.pathname === "/pointer-smoke.html") {
      await route.fulfill({
        status: 200,
        contentType: contentTypes.get(".html"),
        body: pointerSmokeHtml
      });
      return;
    }

    if (url.pathname === "/lifecycle-smoke.html") {
      await route.fulfill({
        status: 200,
        contentType: contentTypes.get(".html"),
        body: lifecycleSmokeHtml
      });
      return;
    }

    if (url.pathname === "/gamepad-smoke.html") {
      await route.fulfill({
        status: 200,
        contentType: contentTypes.get(".html"),
        body: gamepadSmokeHtml
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
    <input id="text-input" aria-label="text input" />
    <textarea id="text-area" aria-label="text area"></textarea>
    <select id="select-field" aria-label="select field">
      <option>One</option>
    </select>
    <div id="editable-region" contenteditable="true" role="textbox">editable</div>
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

const gamepadSmokeHtml = String.raw`
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
    <main id="target">gamepad target</main>
    <script type="module">
      import { createInputFlow } from "@inputflow/core";
      import { createGamepadSource } from "@inputflow/browser";

      const input = createInputFlow({
        maps: [
          {
            actions: [
              { id: "browser.gamepad.confirm", valueType: "button" },
              { id: "browser.gamepad.move", valueType: "axis2d" }
            ],
            bindings: [
              {
                id: "browser.gamepad.confirm.south",
                action: "browser.gamepad.confirm",
                source: { kind: "control", path: "<Gamepad>/button/south" }
              },
              {
                id: "browser.gamepad.move.left",
                action: "browser.gamepad.move",
                source: { kind: "control", path: "<Gamepad>/stick/left" }
              }
            ]
          }
        ]
      });

      window.inputFlowGamepadPads = [];
      input.addSource(
        createGamepadSource({
          getGamepads: () => window.inputFlowGamepadPads
        })
      );

      window.inputFlowGamepadSmoke = {
        read(timeMs = performance.now()) {
          input.update(timeMs);
          return {
            confirm: input.readButton("browser.gamepad.confirm"),
            move: input.readAxis2D("browser.gamepad.move")
          };
        },
        setPads(pads) {
          window.inputFlowGamepadPads = pads;
        }
      };
      document.body.dataset.inputflowReady = "true";
    </script>
  </body>
</html>
`;

const lifecycleSmokeHtml = String.raw`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      #target {
        display: block;
        inline-size: 160px;
        block-size: 120px;
      }
    </style>
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
    <button id="target" type="button">lifecycle target</button>
    <script type="module">
      import { createPointerSource } from "@inputflow/browser";

      const target = document.getElementById("target");
      const events = [];
      let timeMs = 0;
      const pointer = createPointerSource({
        target,
        blurTarget: window,
        now: () => timeMs
      });
      const sink = {
        push(event) {
          events.push({
            control: event.control,
            value: event.value,
            timeMs: event.timeMs
          });
        }
      };

      window.inputFlowLifecycleSmoke = {
        clear() {
          events.length = 0;
        },
        connect() {
          pointer.connect(sink);
        },
        disconnect(nextTimeMs = timeMs) {
          timeMs = nextTimeMs;
          pointer.disconnect();
        },
        events() {
          return [...events];
        },
        setTime(nextTimeMs) {
          timeMs = nextTimeMs;
        }
      };
      document.body.dataset.inputflowReady = "true";
    </script>
  </body>
</html>
`;

const pointerSmokeHtml = String.raw`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      #target {
        display: block;
        inline-size: 160px;
        block-size: 120px;
      }
    </style>
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
    <button id="target" type="button">pointer target</button>
    <script type="module">
      import { createInputFlow } from "@inputflow/core";
      import { createPointerSource } from "@inputflow/browser";

      const target = document.getElementById("target");
      const input = createInputFlow({
        maps: [
          {
            actions: [
              { id: "browser.pointer.interact", valueType: "button" },
              { id: "browser.pointer.scroll", valueType: "axis2d" }
            ],
            bindings: [
              {
                id: "browser.pointer.interact.primary",
                action: "browser.pointer.interact",
                source: { kind: "control", path: "<Pointer>/button/primary" }
              },
              {
                id: "browser.pointer.scroll.wheel",
                action: "browser.pointer.scroll",
                source: { kind: "control", path: "<Pointer>/wheel/main" }
              }
            ]
          }
        ]
      });

      const pointer = createPointerSource({
        target,
        blurTarget: window,
        now: () => window.inputFlowPointerNow ?? performance.now()
      });
      input.addSource(pointer);

      const read = (timeMs = performance.now()) => {
        window.inputFlowPointerNow = timeMs;
        input.update(timeMs);
        return input.readButton("browser.pointer.interact");
      };
      const readWheel = (timeMs = performance.now()) => {
        window.inputFlowPointerNow = timeMs;
        input.update(timeMs);
        return input.readAxis2D("browser.pointer.scroll");
      };

      window.inputFlowPointerSmoke = {
        read,
        readWheel,
        disconnect(timeMs = performance.now()) {
          window.inputFlowPointerNow = timeMs;
          pointer.disconnect();
          return read(timeMs);
        },
        dispatchCancel() {
          target.dispatchEvent(
            new PointerEvent("pointercancel", {
              button: 0,
              bubbles: true
            })
          );
        }
      };
      document.body.dataset.inputflowReady = "true";
    </script>
  </body>
</html>
`;
