import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL!)
// Note: For a full project, you'd define your Drizzle schema based on the SQL above.
// For this example, we'll use raw SQL queries via the `sql` object for brevity in API routes.
// const db = drizzle(sql, { schema });
// export default db;

export { sql } // Exporting the raw query builder for now
