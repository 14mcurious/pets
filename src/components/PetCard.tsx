import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

export const TINTS = [
  "bg-amber-100",
  "bg-orange-100",
  "bg-yellow-100",
  "bg-lime-100",
  "bg-green-100",
  "bg-teal-100",
  "bg-sky-100",
  "bg-rose-100",
];

export const tintFor = (id: number) => TINTS[Math.abs(id) % TINTS.length];

export function petChips(pet: Pet): string[] {
  const chips: string[] = [];
  if (pet.interested_in) chips.push(`Interested: ${pet.interested_in}`);
  if (pet.adopted_by) chips.push(`Adopted by ${pet.adopted_by}`);
  if (pet.appointment_with) chips.push(`Visit: ${pet.appointment_with}`);
  return chips;
}

export default function PetCard({ pet, index = 0 }: { pet: Pet; index?: number }) {
  const chips = petChips(pet);
  return (
    <article
      className="flex animate-fade-up flex-col rounded-2xl border bg-pet-card p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <span
          role="img"
          aria-label={`${pet.name} the ${pet.species || "pet"}`}
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl text-4xl",
            tintFor(pet.id)
          )}
        >
          {pet.emoji || "🐾"}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {pet.age || "Age unknown"}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold">
        <Link to={`/pets/${pet.id}`} className="hover:text-primary">
          {pet.name}
        </Link>
      </h3>
      <p className="text-sm font-medium text-primary">{pet.species || "New arrival"}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {pet.blurb || "A fresh arrival still waiting to be introduced to the neighborhood."}
      </p>
      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${pet.name} updates`}>
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {chip}
            </li>
          ))}
        </ul>
      )}
      <Link
        to={`/pets/${pet.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
      >
        Meet {pet.name}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
