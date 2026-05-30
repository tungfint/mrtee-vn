import { spawnSync } from "node:child_process";

if (process.argv.includes("--check")) {
  console.log("cpanel-first-deploy script is ready.");
  process.exit(0);
}

function run(command, args) {
  console.log(`\n==> ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    env: process.env,
    shell: true,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it in cPanel Node.js App environment variables first.");
}

console.log("Starting first deploy tasks for mrtee.vn");
run("npx", ["prisma", "migrate", "deploy"]);
run("node", ["prisma/seed.mjs"]);
console.log("\nFirst deploy tasks completed. Restart the Node.js App now.");
