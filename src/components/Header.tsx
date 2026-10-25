import { NavLink } from "react-router-dom";
import { Home, PencilLine, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          Adorkable Pets
        </NavLink>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <NavLink to="/" className={linkClass}>
            <Home className="size-4" aria-hidden="true" />
            Home
          </NavLink>
          <NavLink to="/pets" className={linkClass}>
            <PawPrint className="size-4" aria-hidden="true" />
            Pets
          </NavLink>
          <NavLink to="/pets-manager" className={linkClass}>
            <PencilLine className="size-4" aria-hidden="true" />
            Manage
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
