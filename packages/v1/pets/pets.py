import json

PET_COLUMNS = (
    "name",
    "species",
    "age",
    "emoji",
    "blurb",
    "interested_in",
    "adopted_by",
    "adopted_at",
    "appointment_with",
    "appointment_at",
)

SELECT_SQL = (
    "SELECT id, name, species, age, emoji, blurb, interested_in, adopted_by, "
    "adopted_at, appointment_with, appointment_at, created_at FROM pets"
)


def request_data(args):
    data = dict(args) if isinstance(args, dict) else {}
    body = data.get("body")
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    merged = dict(body) if isinstance(body, dict) else {}
    ignored = {"body", "POSTGRES_URL", "__ow_method", "__ow_headers", "__ow_path"}
    merged.update({k: v for k, v in data.items() if k not in ignored})
    return merged


def request_method(args):
    return str(args.get("__ow_method") or args.get("method") or "GET").upper()


def request_route_id(args, data):
    for key in ("id", "pet_id"):
        value = data.get(key)
        if value not in (None, ""):
            return str(value)
    raw_path = str(args.get("__ow_path") or args.get("path") or "").strip("/")
    if not raw_path:
        return ""
    parts = [part for part in raw_path.split("/") if part]
    return parts[-1] if parts else ""


def clean(value, limit=500):
    if value is None:
        return ""
    return str(value).strip()[:limit]


def row_to_pet(row):
    return {
        "id": row[0],
        "name": row[1],
        "species": row[2],
        "age": row[3],
        "emoji": row[4],
        "blurb": row[5],
        "interested_in": row[6],
        "adopted_by": row[7],
        "adopted_at": row[8],
        "appointment_with": row[9],
        "appointment_at": row[10],
        "created_at": str(row[11]) if row[11] is not None else "",
    }


def fetch_pet(conn, pet_id):
    with conn.cursor() as cur:
        cur.execute(SELECT_SQL + " WHERE id = %s", (pet_id,))
        row = cur.fetchone()
    return row_to_pet(row) if row else None


def main(args, ctx=None):
    if not ctx or not hasattr(ctx, "POSTGRESQL"):
        return {"ok": False, "error": "Database not configured"}

    conn = ctx.POSTGRESQL
    method = request_method(args)
    data = request_data(args)

    try:
        if method == "GET":
            pet_id = request_route_id(args, data)
            with conn.cursor() as cur:
                if pet_id:
                    cur.execute(SELECT_SQL + " WHERE id = %s", (pet_id,))
                    rows = cur.fetchall()
                else:
                    cur.execute(SELECT_SQL + " ORDER BY created_at DESC")
                    rows = cur.fetchall()
            pets = [row_to_pet(row) for row in rows]
            if pet_id and not pets:
                return {"ok": False, "error": "Pet not found"}
            return {"ok": True, "pets": pets}

        if method == "POST":
            name = clean(data.get("name"), 200)
            if not name:
                return {"ok": False, "error": "Pet name is required"}
            values = {
                "name": name,
                "species": clean(data.get("species"), 200),
                "age": clean(data.get("age"), 100),
                "emoji": clean(data.get("emoji"), 16) or "🐾",
                "blurb": clean(data.get("blurb"), 2000),
                "interested_in": clean(data.get("interested_in"), 500),
                "adopted_by": clean(data.get("adopted_by"), 500),
                "adopted_at": clean(data.get("adopted_at"), 50),
                "appointment_with": clean(data.get("appointment_with"), 500),
                "appointment_at": clean(data.get("appointment_at"), 50),
            }
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO pets (
                        name, species, age, emoji, blurb, interested_in,
                        adopted_by, adopted_at, appointment_with, appointment_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id
                    """,
                    (
                        values["name"],
                        values["species"],
                        values["age"],
                        values["emoji"],
                        values["blurb"],
                        values["interested_in"],
                        values["adopted_by"],
                        values["adopted_at"],
                        values["appointment_with"],
                        values["appointment_at"],
                    ),
                )
                new_id = cur.fetchone()[0]
            conn.commit()
            return {"ok": True, "pet": fetch_pet(conn, new_id)}

        if method == "PUT":
            pet_id = request_route_id(args, data)
            if not pet_id:
                return {"ok": False, "error": "Pet id is required"}
            limits = {
                "name": 200,
                "species": 200,
                "age": 100,
                "emoji": 16,
                "blurb": 2000,
                "interested_in": 500,
                "adopted_by": 500,
                "adopted_at": 50,
                "appointment_with": 500,
                "appointment_at": 50,
            }
            # Only overwrite the fields actually present in the request so a
            # partial update (e.g. booking an appointment) preserves the rest.
            sets = []
            params = []
            for col in ("name", "species", "age", "emoji", "blurb",
                        "interested_in", "adopted_by", "adopted_at",
                        "appointment_with", "appointment_at"):
                if col not in data:
                    continue
                value = clean(data.get(col), limits[col])
                if col == "name" and not value:
                    continue
                sets.append("%s = %%s" % col)
                params.append(value)
            if not sets:
                return {"ok": False, "error": "No fields to update"}
            params.append(pet_id)
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE pets SET %s WHERE id = %%s RETURNING id" % ", ".join(sets),
                    tuple(params),
                )
                updated = cur.fetchone()
            conn.commit()
            if not updated:
                return {"ok": False, "error": "Pet not found"}
            return {"ok": True, "pet": fetch_pet(conn, pet_id)}

        if method == "DELETE":
            pet_id = request_route_id(args, data)
            if not pet_id:
                return {"ok": False, "error": "Pet id is required"}
            with conn.cursor() as cur:
                cur.execute("DELETE FROM pets WHERE id = %s", (pet_id,))
                deleted = cur.rowcount
            conn.commit()
            if not deleted:
                return {"ok": False, "error": "Pet not found"}
            return {"ok": True, "deleted": pet_id}

        return {"ok": False, "error": "Method %s not allowed" % method}
    except Exception as exc:
        try:
            conn.rollback()
        except Exception:
            pass
        return {"ok": False, "error": str(exc)}
