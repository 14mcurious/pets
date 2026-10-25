import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  HeartHandshake,
  Loader2,
  PencilLine,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pet, PetDraft, PetUpdate } from "@/types";
import { createPet, deletePet, listPets, updatePet } from "@/api/pets";
import Header from "@/components/Header";

const EMOJI_CHOICES = ["🐶", "🐱", "🐰", "🐹", "🦜", "🐢", "🐟", "🦊", "🐾"];

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "error"; message: string } | { kind: "saved" };

function toDraft(p: Pet): PetDraft {
  return { name: p.name, species: p.species, age: p.age, emoji: p.emoji, blurb: p.blurb };
}

function toUpdate(p: Pet): PetUpdate {
  return {
    interested_in: p.interested_in,
    adopted_by: p.adopted_by,
    adopted_at: p.adopted_at,
    appointment_with: p.appointment_with,
    appointment_at: p.appointment_at,
  };
}

/* ---------------- Add-new-pet form ---------------- */

function AddPetForm({ onCreated }: { onCreated: () => void }) {
  const [draft, setDraft] = useState<PetDraft>({
    name: "",
    species: "",
    age: "",
    emoji: "🐾",
    blurb: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof PetDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("A name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createPet(draft);
      setDraft({ name: "", species: "", age: "", emoji: "🐾", blurb: "" });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add pet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border bg-card p-6 shadow-sm"
      aria-labelledby="add-pet-heading"
    >
      <h2 id="add-pet-heading" className="flex items-center gap-2 text-lg font-bold">
        <Plus className="size-5 text-primary" aria-hidden="true" />
        Add a new pet
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field id="pet-name" label="Name" required>
          <input
            id="pet-name"
            name="pet-name"
            value={draft.name}
            onChange={set("name")}
            placeholder="e.g. Biscuit"
            className={inputClass}
          />
        </Field>
        <Field id="pet-species" label="Species">
          <input
            id="pet-species"
            name="pet-species"
            value={draft.species}
            onChange={set("species")}
            placeholder="e.g. Golden Retriever"
            className={inputClass}
          />
        </Field>
        <Field id="pet-age" label="Age">
          <input
            id="pet-age"
            name="pet-age"
            value={draft.age}
            onChange={set("age")}
            placeholder="e.g. 3 years"
            className={inputClass}
          />
        </Field>
        <Field id="pet-emoji" label="Portrait">
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_CHOICES.map((em) => (
              <button
                key={em}
                type="button"
                aria-label={`Choose portrait ${em}`}
                aria-pressed={draft.emoji === em}
                onClick={() => setDraft((d) => ({ ...d, emoji: em }))}
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border text-xl transition-colors",
                  draft.emoji === em
                    ? "border-primary bg-primary/10"
                    : "bg-background hover:bg-muted"
                )}
              >
                {em}
              </button>
            ))}
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field id="pet-blurb" label="About">
            <textarea
              id="pet-blurb"
              name="pet-blurb"
              value={draft.blurb}
              onChange={set("blurb")}
              rows={2}
              placeholder="A few words about this pet…"
              className={inputClass}
            />
          </Field>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
        {busy ? "Adding…" : "Add pet"}
      </button>
    </form>
  );
}

/* ---------------- Per-pet management card ---------------- */

function PetManageCard({ pet, onChanged, onDeleted }: {
  pet: Pet;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState<PetUpdate>(toUpdate(pet));
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    setDraft(toUpdate(pet));
    setStatus({ kind: "idle" });
  }, [pet]);

  const set = (key: keyof PetUpdate) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value }));

  const save = async () => {
    setStatus({ kind: "busy" });
    try {
      await updatePet(pet.id, draft);
      setStatus({ kind: "saved" });
      onChanged();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Could not save." });
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove ${pet.name}? This cannot be undone.`)) return;
    setStatus({ kind: "busy" });
    try {
      await deletePet(pet.id);
      onDeleted();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Could not delete." });
    }
  };

  return (
    <article className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            role="img"
            aria-label={`${pet.name} the ${pet.species || "pet"}`}
            className="flex size-14 items-center justify-center rounded-2xl bg-accent/40 text-3xl"
          >
            {pet.emoji || "🐾"}
          </span>
          <div>
            <h3 className="text-lg font-bold leading-tight">{pet.name}</h3>
            <p className="text-sm text-muted-foreground">
              {[pet.species, pet.age].filter(Boolean).join(" · ") || "New arrival"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          aria-label={`Delete ${pet.name}`}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {pet.blurb && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pet.blurb}</p>
      )}

      <div className="mt-4 flex-1 space-y-4 border-t pt-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" /> Interested in adopting
          </p>
          <Field id={`interested-${pet.id}`} label="Who is interested?">
            <input
              id={`interested-${pet.id}`}
              name={`interested-${pet.id}`}
              value={draft.interested_in}
              onChange={set("interested_in")}
              placeholder="Name of the interested person"
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <HeartHandshake className="size-3.5" aria-hidden="true" /> Adoption
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id={`adopted-by-${pet.id}`} label="Adopted by">
              <input
                id={`adopted-by-${pet.id}`}
                name={`adopted-by-${pet.id}`}
                value={draft.adopted_by}
                onChange={set("adopted_by")}
                placeholder="Name of the adopter"
                className={inputClass}
              />
            </Field>
            <Field id={`adopted-at-${pet.id}`} label="Adopted on">
              <input
                id={`adopted-at-${pet.id}`}
                name={`adopted-at-${pet.id}`}
                type="date"
                value={draft.adopted_at}
                onChange={set("adopted_at")}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden="true" /> Visit appointment
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id={`appt-with-${pet.id}`} label="Visiting with">
              <input
                id={`appt-with-${pet.id}`}
                name={`appt-with-${pet.id}`}
                value={draft.appointment_with}
                onChange={set("appointment_with")}
                placeholder="e.g. Vet Clinic"
                className={inputClass}
              />
            </Field>
            <Field id={`appt-when-${pet.id}`} label="Date & time">
              <input
                id={`appt-when-${pet.id}`}
                name={`appt-when-${pet.id}`}
                type="datetime-local"
                value={draft.appointment_at}
                onChange={set("appointment_at")}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {status.kind === "error" ? (
          <p role="alert" className="text-sm text-red-600">{status.message}</p>
        ) : status.kind === "saved" ? (
          <p className="text-sm font-medium text-green-600">Saved</p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={save}
          disabled={status.kind === "busy"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {status.kind === "busy" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <PencilLine className="size-4" aria-hidden="true" />
          )}
          {status.kind === "busy" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </article>
  );
}

/* ---------------- Shared bits ---------------- */

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function PetsManager() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await listPets();
      setPets(data.pets || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pet information</h1>
          <p className="mt-2 text-muted-foreground">
            Add new pets and keep their adoption and visit details up to date.
          </p>
        </div>

        <div className="space-y-8">
          <AddPetForm onCreated={() => load()} />

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              <span>Loading pets…</span>
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : pets.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
              No pets yet — add your first friend above.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {pets.map((pet) => (
                <PetManageCard
                  key={pet.id}
                  pet={pet}
                  onChanged={() => load()}
                  onDeleted={() => load()}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
