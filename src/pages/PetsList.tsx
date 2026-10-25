import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, PawPrint, RefreshCw, Search, SearchX } from "lucide-react";
import Header from "@/components/Header";
import PetCard from "@/components/PetCard";
import { listPets } from "@/api/pets";
import type { Pet } from "@/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; pets: Pet[]; query: string };

export default function PetsList() {
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const requestSeq = useRef(0);

  // Debounce the search so we only hit the API once the user pauses typing.
  useEffect(() => {
    const seq = ++requestSeq.current;
    setState({ kind: "loading" });
    const timer = window.setTimeout(async () => {
      try {
        const data = await listPets(search);
        if (seq !== requestSeq.current) return;
        setState({ kind: "ready", pets: data.pets || [], query: search.trim() });
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Could not load pets.",
        });
      }
    }, search.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [search, reloadKey]);

  const retry = () => {
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pets</h1>
            <p className="mt-2 text-muted-foreground">
              Browse the whole crew and open a profile for the full story.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <label htmlFor="pet-search" className="mb-1 block text-sm font-medium">
              Search pets
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="pet-search"
                name="pet-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or species, e.g. Matisse or Dog"
                className="w-full rounded-full border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>
        </div>

        {state.kind === "ready" && (
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {state.query
              ? `${state.pets.length} result${state.pets.length === 1 ? "" : "s"} for “${state.query}”`
              : `${state.pets.length} pet${state.pets.length === 1 ? "" : "s"} in the crew`}
          </p>
        )}

        {state.kind === "loading" && (
          <div
            className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-10 text-muted-foreground"
            aria-busy="true"
          >
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            <span>Loading pets…</span>
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
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && state.pets.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            <SearchX className="size-8" aria-hidden="true" />
            {state.query ? (
              <p>No pets match “{state.query}”. Try a different name or species.</p>
            ) : (
              <p>
                No pets yet. Add the first friend in the{" "}
                <Link to="/pets-manager" className="font-semibold text-primary hover:underline">
                  pet manager
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {state.kind === "ready" && state.pets.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.pets.map((pet, index) => (
              <PetCard key={pet.id} pet={pet} index={index} />
            ))}
          </div>
        )}

        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <PawPrint className="size-4" aria-hidden="true" />
          Need to add a pet or update adoption details? Open the{" "}
          <Link to="/pets-manager" className="font-semibold text-primary hover:underline">
            pet manager
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
