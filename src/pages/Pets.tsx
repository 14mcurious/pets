import { useRef } from "react";
import {
  Bone,
  Heart,
  PawPrint,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

type Pet = {
  name: string;
  species: string;
  age: string;
  emoji: string;
  blurb: string;
  traits: string[];
  tint: string;
};

const CREW: Pet[] = [
  {
    name: "Biscuit",
    species: "Golden Retriever",
    age: "3 years",
    emoji: "🐶",
    blurb: "Believes every stranger is a long-lost friend and every ball is his life's purpose.",
    traits: ["Zoomies", "Snuggles", "Treats"],
    tint: "bg-amber-100",
  },
  {
    name: "Mochi",
    species: "Shiba Inu",
    age: "2 years",
    emoji: "🦊",
    blurb: "A tiny fox with opinions. Guards the sofa like a castle and naps like a champion.",
    traits: ["Sassy", "Sunny spot", "Chonky"],
    tint: "bg-orange-100",
  },
  {
    name: "Waffles",
    species: "Tabby Cat",
    age: "4 years",
    emoji: "🐱",
    blurb: "Eats, sleeps, judges. Will knock your pens off the table out of pure love.",
    traits: ["Indoor", "Miso soup", "Boss"],
    tint: "bg-yellow-100",
  },
  {
    name: "Pip",
    species: "Cockatiel",
    age: "1 year",
    emoji: "🦜",
    blurb: "Whistles the kettle song at 7am sharp. Small bird, enormous ego.",
    traits: ["Chirpy", "Head tilts", "Snacks"],
    tint: "bg-lime-100",
  },
  {
    name: "Clover",
    species: "Holland Lop",
    age: "2 years",
    emoji: "🐰",
    blurb: "Floppy-eared escape artist. Binky specialist and professional carrot enthusiast.",
    traits: ["Binkies", "Gentle", "Chewy"],
    tint: "bg-green-100",
  },
  {
    name: "Doodle",
    species: "Tortoise",
    age: "52 years",
    emoji: "🐢",
    blurb: "The elder of the house. Moves at its own pace and knows exactly what it wants.",
    traits: ["Wise", "Slow", "Legendary"],
    tint: "bg-teal-100",
  },
];

const STATS = [
  { icon: PawPrint, value: "6", label: "Furry & feathery friends" },
  { icon: Heart, value: "∞", label: "Zoomies per day" },
  { icon: Stethoscope, value: "100%", label: "Vet-check approved" },
  { icon: Sparkles, value: "1", label: "Unforgettable crew" },
];

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

function Stats() {
  return (
    <section aria-label="Crew statistics" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <dl className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label }) => (
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

function PetCard({ pet, index }: { pet: Pet; index: number }) {
  return (
    <article
      className="flex animate-fade-up flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <span
          role="img"
          aria-label={`${pet.name} the ${pet.species}`}
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl text-4xl",
            pet.tint
          )}
        >
          {pet.emoji}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {pet.age}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{pet.name}</h3>
      <p className="text-sm font-medium text-primary">{pet.species}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {pet.blurb}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${pet.name} traits`}>
        {pet.traits.map((trait) => (
          <li
            key={trait}
            className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {trait}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Crew({ forwardRef }: { forwardRef: React.RefObject<HTMLDivElement> }) {
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
            Six adorkable residents, zero bad days.
          </p>
        </div>
        <span className="hidden rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground sm:inline-flex">
          Updated today
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CREW.map((pet, index) => (
          <PetCard key={pet.name} pet={pet} index={index} />
        ))}
      </div>
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

  const scrollToCrew = () => {
    crewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero onMeetCrew={scrollToCrew} />
        <Stats />
        <Crew forwardRef={crewRef} />
      </main>
      <Footer />
    </div>
  );
}
