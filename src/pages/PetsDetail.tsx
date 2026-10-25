import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  HeartHandshake,
  Loader2,
  PencilLine,
  PawPrint,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Header from "@/components/Header";
import { tintFor } from "@/components/PetCard";
import { getPet } from "@/api/pets";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; pet: Pet };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold">
        {value || <span className="font-normal text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

export default function PetsDetail() {
  const { id } = useParams<{ id: string }>();
  const petId = Number(id);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!Number.isFinite(petId) || petId <= 0) {
      setState({ kind: "error", message: "Invalid pet id." });
      return;
    }
    setState({ kind: "loading" });
    getPet(petId)
      .then((pet) => {
        if (!cancelled) setState({ kind: "ready", pet });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : "Could not load this pet.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [petId, reloadKey]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <Link
          to="/pets"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all pets
        </Link>

        {state.kind === "loading" && (
          <div
            className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-10 text-muted-foreground"
            aria-busy="true"
          >
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            <span>Loading profile…</span>
          </div>
        )}

        {state.kind === "error" && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-10 text-center"
          >
            <p className="text-sm text-red-700">{state.message}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
            <Link to="/pets" className="text-sm font-semibold text-primary hover:underline">
              Browse the crew instead
            </Link>
          </div>
        )}

        {state.kind === "ready" && (
          <div className="space-y-6">
            <article className="rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <span
                  role="img"
                  aria-label={`${state.pet.name} the ${state.pet.species || "pet"}`}
                  className={cn(
                    "flex size-24 shrink-0 items-center justify-center rounded-3xl text-6xl",
                    tintFor(state.pet.id)
                  )}
                >
                  {state.pet.emoji || "🐾"}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{state.pet.name}</h1>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {state.pet.age || "Age unknown"}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-medium text-primary">
                    {state.pet.species || "New arrival"}
                  </p>
                  {state.pet.blurb && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {state.pet.blurb}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={`/pets-manager?pet=${state.pet.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <PencilLine className="size-4" aria-hidden="true" />
                      Edit in manager
                    </Link>
                    <Link
                      to="/pets"
                      className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <PawPrint className="size-4" aria-hidden="true" />
                      All pets
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-6 sm:grid-cols-2">
              <section
                aria-labelledby="adoption-heading"
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <h2
                  id="adoption-heading"
                  className="flex items-center gap-2 text-lg font-bold"
                >
                  <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
                  Adoption
                </h2>
                <dl className="mt-3">
                  <InfoRow label="Interested in" value={state.pet.interested_in} />
                  <InfoRow label="Adopted by" value={state.pet.adopted_by} />
                  <InfoRow label="Adopted on" value={state.pet.adopted_at} />
                </dl>
              </section>

              <section
                aria-labelledby="visit-heading"
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <h2
                  id="visit-heading"
                  className="flex items-center gap-2 text-lg font-bold"
                >
                  <CalendarClock className="size-5 text-primary" aria-hidden="true" />
                  Visit appointment
                </h2>
                <dl className="mt-3">
                  <InfoRow label="Visiting with" value={state.pet.appointment_with} />
                  <InfoRow label="Date & time" value={state.pet.appointment_at} />
                </dl>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" aria-hidden="true" />
                  Update these details in the{" "}
                  <Link to={`/pets-manager?pet=${state.pet.id}`} className="font-semibold text-primary hover:underline">
                    pet manager
                  </Link>
                  .
                </p>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
