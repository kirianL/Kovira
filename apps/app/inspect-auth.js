try {
  const dbPkg = require("better-auth/db");
  console.log("better-auth/db exports:", Object.keys(dbPkg));
} catch (e) {
  console.log("Failed to require better-auth/db:", e.message);
}

try {
  const authPkg = require("better-auth");
  console.log("better-auth exports:", Object.keys(authPkg));
} catch (e) {
  console.log("Failed to require better-auth:", e.message);
}
