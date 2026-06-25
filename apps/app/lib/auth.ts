import { betterAuth } from "better-auth";
import { dash, sentinel } from "@better-auth/infra";
import { DatabaseSync } from "node:sqlite";
import { getSchema } from "better-auth/db";
import path from "path";

// Initialize SQLite database in the current working directory
const dbPath = path.join(process.cwd(), "database.sqlite");
const db = new DatabaseSync(dbPath);

const authOptions = {
  database: db,
  trustedOrigins: [
    "https://kovira-web.vercel.app",
    "http://localhost:3000",
    "http://localhost:4321"
  ],
  allowedHosts: [
    "kovira-web.vercel.app",
    "kovira-app.vercel.app",
    "localhost:3000",
    "localhost:4321"
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "github_placeholder_id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "github_placeholder_secret"
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "google_placeholder_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google_placeholder_secret"
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "linkedin_placeholder_id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "linkedin_placeholder_secret"
    }
  },
  plugins: [
    dash(),
    sentinel()
  ]
};

export const auth = betterAuth(authOptions);

// Dynamically create tables from Better Auth schema if they don't exist
function initDatabase() {
  try {
    const schema = getSchema(authOptions);
    const tables = Object.entries(schema).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
    
    for (const [tableName, tableConfig] of tables) {
      const columns = ["id TEXT PRIMARY KEY"];
      const foreignKeys = [];
      const indexes = [];

      for (const [fieldName, fieldConfig] of Object.entries(tableConfig.fields)) {
        if (fieldName === "id") continue;

        let type = "TEXT";
        if (fieldConfig.type === "boolean") {
          type = "INTEGER";
        } else if (fieldConfig.type === "number") {
          type = "INTEGER";
        } else if (fieldConfig.type === "date") {
          type = "TEXT";
        }

        let constraints = "";
        if (fieldConfig.required && !fieldConfig.references) {
          constraints += " NOT NULL";
        }
        if (fieldConfig.unique) {
          constraints += " UNIQUE";
        }
        if (fieldConfig.defaultValue !== undefined) {
          let def = fieldConfig.defaultValue;
          const isJsFunction = typeof def === "function" || 
            (typeof def === "string" && (def.includes("=>") || def.includes("function") || def.includes("new Date")));
          
          if (!isJsFunction) {
            if (typeof def === "boolean") {
              def = def ? 1 : 0;
            }
            constraints += ` DEFAULT ${typeof def === "string" ? `'${def}'` : def}`;
          }
        }

        columns.push(`"${fieldConfig.fieldName || fieldName}" ${type}${constraints}`);

        if (fieldConfig.references) {
          foreignKeys.push(`FOREIGN KEY ("${fieldConfig.fieldName || fieldName}") REFERENCES "${fieldConfig.references.model}"("${fieldConfig.references.field}") ON DELETE CASCADE`);
        }

        if (fieldConfig.index) {
          indexes.push(`CREATE INDEX IF NOT EXISTS "idx_${tableName}_${fieldConfig.fieldName || fieldName}" ON "${tableName}" ("${fieldConfig.fieldName || fieldName}")`);
        }
      }

      const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${[...columns, ...foreignKeys].join(",\n  ")}\n);`;
      db.exec(createTableSQL);

      for (const indexSQL of indexes) {
        db.exec(indexSQL);
      }
    }
  } catch (error) {
    console.error("Failed to initialize Better Auth SQLite database tables:", error);
  }
}

// Run table initialization
initDatabase();

