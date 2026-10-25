def main(args, ctx=None):
    if not ctx or not hasattr(ctx, "POSTGRESQL"):
        return {"ok": False, "error": "Database not configured"}

    conn = ctx.POSTGRESQL
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS pets (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    species TEXT NOT NULL DEFAULT '',
                    age TEXT NOT NULL DEFAULT '',
                    emoji TEXT NOT NULL DEFAULT '🐾',
                    blurb TEXT NOT NULL DEFAULT '',
                    interested_in TEXT NOT NULL DEFAULT '',
                    adopted_by TEXT NOT NULL DEFAULT '',
                    adopted_at TEXT NOT NULL DEFAULT '',
                    appointment_with TEXT NOT NULL DEFAULT '',
                    appointment_at TEXT NOT NULL DEFAULT '',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
                """
            )
            # Re-runnable migrations so a pre-existing table converges to the
            # current schema (newer app generations may have added columns).
            for ddl in (
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS species TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS age TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS emoji TEXT NOT NULL DEFAULT '🐾'",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS blurb TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS interested_in TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS adopted_by TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS adopted_at TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS appointment_with TEXT NOT NULL DEFAULT ''",
                "ALTER TABLE pets ADD COLUMN IF NOT EXISTS appointment_at TEXT NOT NULL DEFAULT ''",
            ):
                cur.execute(ddl)
        conn.commit()
        return {"ok": True, "tables": ["pets"]}
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": str(exc)}
