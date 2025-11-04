const { spawn } = require("node:child_process");

async function main() {
  return new Promise((resolve, reject) => {
    const child = spawn("next", ["build", "--webpack"], {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_DISABLE_TURBOPACK: "1",
        NEXT_USE_TURBOPACK: "0",
      },
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`next build exited with code ${code}`));
      }
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
