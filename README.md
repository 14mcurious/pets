# 🐾 Adorkable Pets

A playful pet-shelter web app for browsing the crew, viewing pet profiles, and
keeping adoption and visit details up to date. Every wag, whisker, feather,
and flop included.

## Features

- **Home page** — hero, live crew statistics (total pets, happily adopted,
  visits on the books), and a card grid of all pets.
- **Pets list** — browse the whole crew with a debounced search by name or
  species.
- **Pet profile** — a full profile page per pet with emoji portrait, age,
  species, blurb, adoption info, and visit-appointment details.
- **Pet manager** — add new pets (name, species, age, emoji portrait, blurb),
  edit each pet's adoption status (`interested_in`, `adopted_by`,
  `adopted_at`) and visit appointment (`appointment_with`, `appointment_at`)
  with partial updates, and delete pets (with confirmation).
- **Focused editing** — a profile deep-links to the manager as
  `/#/pets-manager?pet=<id>` so you land straight on that pet's form.
- **Resilient UI** — explicit loading, error (with retry), and empty states
  on every data view; responsive Tailwind layout.

## Routes

The app uses React Router with `HashRouter` (serverless-friendly):

| Route                | Page                                            |
| -------------------- | ----------------------------------------------- |
| `#/`                 | Home — hero, stats, crew grid                   |
| `#/pets`             | Pets list with search                           |
| `#/pets/:id`         | Individual pet profile                          |
| `#/pets-manager`     | Add / edit / delete pets (supports `?pet=<id>`) |

## Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite
- React Router v6 (`HashRouter`)
- TailwindCSS (CSS-variable theming in `src/index.css`)
- `lucide-react` icons, `clsx` + `tailwind-merge` (`cn()` in `src/lib/utils.ts`)

**Backend**

- Python OpenServerless web actions (editable modules under `packages/`)
- PostgreSQL via the generated `ctx.POSTGRESQL` connection

## Architecture

```
Browser
  │  fetch /api/my/v1/pets (relative URL)
  ▼
OpenServerless web action  →  v1/pets (packages/v1/pets/pets.py)
                              │
                              ▼
                        PostgreSQL (pets table)
```

- `src/api/pets.ts` is the frontend API client. It calls the single public
  endpoint `/api/my/v1/pets` and normalizes both direct and `body`-wrapped
  action payloads before reading fields.
- `packages/v1/pets/pets.py` is one REST action that branches on
  `__ow_method`: GET (list/search/one), POST (create or search), PUT (partial
  update), DELETE. It reads request fields defensively (top-level fields plus
  an optional `body` dict/string) and resolves the pet id from the route path
  or body.
- `packages/setup/database/database.py` is a private, idempotent setup action
  that creates the `pets` table (plus re-runnable `ADD COLUMN IF NOT EXISTS`
  migrations) so a fresh instance converges to the current schema.

## Data Model

`pets` table:

| Column             | Type         | Notes                        |
| ------------------ | ------------ | ---------------------------- |
| `id`               | SERIAL PK    | auto-generated               |
| `name`             | TEXT         | required                     |
| `species`          | TEXT         | e.g. "Golden Retriever"      |
| `age`              | TEXT         | e.g. "3 years"               |
| `emoji`            | TEXT         | portrait, defaults to 🐾     |
| `blurb`            | TEXT         | short bio                    |
| `interested_in`    | TEXT         | adoption interest            |
| `adopted_by`       | TEXT         | adopter name                 |
| `adopted_at`       | TEXT         | adoption date                |
| `appointment_with` | TEXT         | visit companion (e.g. vet)   |
| `appointment_at`   | TEXT         | date & time                  |
| `created_at`       | TIMESTAMPTZ  | defaults to `now()`          |

## API

Base: `/api/my/v1/pets`

| Method   | Path                    | Description                                              |
| -------- | ----------------------- | -------------------------------------------------------- |
| `GET`    | `/api/my/v1/pets`       | List pets, newest first; optional `q` searches name/species |
| `GET`    | `/api/my/v1/pets/{id}`  | Fetch a single pet (`{ "ok": true, "pets": [pet] }`)     |
| `POST`   | `/api/my/v1/pets`       | Create a pet; a `q` field without `name` runs a search instead |
| `PUT`    | `/api/my/v1/pets/{id}`  | Partial update — only fields present in the request are overwritten |
| `DELETE` | `/api/my/v1/pets/{id}`  | Delete a pet                                             |

Responses use a flat `{"ok": true, ...}` / `{"ok": false, "error": "..."}`
shape, e.g. create returns `{"ok": true, "pet": { ... }}` and delete returns
`{"ok": true, "deleted": <id>}`.

Example — book a visit:

```json
PUT /api/my/v1/pets/7
{ "appointment_with": "Vet Clinic", "appointment_at": "2026-05-01T10:00" }
```

## Project Layout

```
src/
├── api/pets.ts          # API client (fetch + payload normalization)
├── components/
│   ├── Header.tsx       # sticky nav (Home / Pets / Manage)
│   └── PetCard.tsx      # crew card + emoji tint helper
├── pages/
│   ├── Pets.tsx         # home: hero, stats, crew grid
│   ├── PetsList.tsx     # searchable list
│   ├── PetsDetail.tsx   # pet profile
│   └── PetsManager.tsx  # add / edit / delete + ?pet=<id> focus mode
├── types.ts             # Pet, PetDraft, PetUpdate
├── lib/utils.ts         # cn() helper
├── App.tsx              # routes
└── main.tsx
packages/
├── v1/pets/pets.py      # public REST action (PostgreSQL)
└── setup/database/      # private idempotent schema setup
```

## Development

The app runs in a Trustant-managed environment: the managed dev watcher owns
packaging and deployment of the actions, and the app is served automatically —
there is nothing to start by hand.

Useful scripts (see `package.json`):

- `npm run typecheck` — TypeScript check
- `npm run build` — typecheck + production Vite build

To verify backend behavior, call the deployed endpoint directly, e.g.
`curl http://localhost:5173/api/my/v1/pets`.
