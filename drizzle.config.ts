
// Convert to CommonJS-compatible TypeScript to avoid ESM/CommonJS mismatch
/* eslint-disable */
declare const require: any;
declare const module: any;
declare const process: any;

require("dotenv/config");
const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
    dialect: "postgresql",
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
    verbose: true,
    strict: true,
});