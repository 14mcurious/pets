import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bone,
  CalendarClock,
  HeartHandshake,
  PawPrint,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import Header from "@/components/Header";
import PetCard from "@/components/PetCard";
import { listPets } from "@/api/pets";
import type { Pet } from "@/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; pets: Pet[] };

function Hero({ onMeetCrew }: { onMeetCrew: () => void }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <Sparkles className="size-4 text-accent-foreground" aria-hidden="true" />
          Welcome to the pack
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Pets
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Meet the most adorable crew in the neighborhood — every wag,
          whisker, feather, and flop included.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onMeetCrew}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <PawPrint className="size-4" aria-hidden="true" />
            Meet the crew
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-3 text-sm font-medium text-muted-foreground">
            <Bone className="size-4" aria-hidden="true" />
            Treats always in season
          </span>
        </div>
      </div>
    </section>
  );
}

function Stats({ pets }: { pets: Pet[] }) {
  const adopted = pets.filter((p) => p.adopted_by).length;
  const visits = pets.filter((p) => p.appointment_with || p.appointment_at).length;
  const items = [
    { icon: PawPrint, value: String(pets.length), label: "Furry & feathery friends" },
    { icon: HeartHandshake, value: String(adopted), label: "Happily adopted" },
    { icon: CalendarClock, value: String(visits), label: "Visits on the books" },
    { icon: Stethoscope, value: "100%", label: "Vet-check approved" },
  ];
  return (
    <section aria-label="Crew statistics" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <dl className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-4">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/40">
              <Icon className="size-5 text-accent-foreground" aria-hidden="true" />
            </span>
            <div>
              <dt className="order-2 text-xs text-muted-foreground">{label}</dt>
              <dd className="order-1 text-xl font-bold">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CrewSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between">
            <div className="size-16 rounded-2xl bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
          <div className="mt-4 h-5 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
          <div className="mt-4 h-10 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function Crew({
  state,
  forwardRef,
  onRetry,
}: {
  state: LoadState;
  forwardRef: React.RefObject<HTMLDivElement>;
  onRetry: () => void;
}) {
  return (
    <section
      ref={forwardRef}
      aria-labelledby="crew-heading"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 id="crew-heading" className="text-3xl font-bold tracking-tight">
            The crew
          </h2>
          <p className="mt-2 text-muted-foreground">
            {state.kind === "ready"
              ? `${state.pets.length} adorkable resident${state.pets.length === 1 ? "" : "s"}, zero bad days.`
              : "Our adorkable residents, zero bad days."}
          </p>
        </div>
        {state.kind === "ready" && (
          <span className="hidden items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground sm:inline-flex">
            <span className="size-2 rounded-full bg-green-500" aria-hidden="true" />
            Live from the shelter
          </span>
        )}
      </div>

      {state.kind === "loading" && <CrewSkeleton />}

      {state.kind === "error" && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-10 text-center"
        >
          <p className="text-sm text-red-700">{state.message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {state.kind === "ready" && state.pets.length === 0 && (
        <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          No residents yet — the crew is on its way. You can add the first pet in the
          <Link to="/pets-manager" className="mx-1 font-semibold text-primary hover:underline">
            pet manager
          </Link>.
        </div>
      )}

      {state.kind === "ready" && state.pets.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.pets.map((pet, index) => (
            <PetCard key={pet.id} pet={pet} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p className="flex items-center gap-2">
          <PawPrint className="size-4" aria-hidden="true" />
          Adorkable Pets
        </p>
        <p>Made with love (and a few dropped treats).</p>
      </div>
    </footer>
  );
}

export default function Pets() {
  const crewRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const data = await listPets();
      setState({ kind: "ready", pets: data.pets || [] });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load the crew.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scrollToCrew = () => {
    crewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero onMeetCrew={scrollToCrew} />
        {state.kind === "ready" ? (
          <Stats pets={state.pets} />
        ) : (
          <section aria-label="Crew statistics" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="animate-pulse grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-6 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <Crew state={state} forwardRef={crewRef} onRetry={load} />
      </main>
      <Footer />
    </div>
  );
}
