import { SQLDatabase } from "encore.dev/storage/sqldb";

// This references the "dapoer" database defined in the dapoer service.
export const db = SQLDatabase.named("dapoer");
