import type { Pet, PetDraft, PetUpdate } from "@/types";

const BASE = "/api/my/v1/pets";

/**
 * The generated action wrapper nests module output under `body`, so normalize
 * both direct and wrapped payloads before reading fields.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const raw = await response.json().catch(() => null);
  const data =
    raw && typeof raw === "object" && "body" in raw ? (raw as { body: T }).body : raw;
  if (!response.ok || (data as { ok?: boolean } | null)?.ok === false) {
    throw new Error(
      (data as { error?: string } | null)?.error || `Request failed: ${response.status}`
    );
  }
  return data as T;
}

export function listPets(search = ""): Promise<{ pets: Pet[] }> {
  const query = search.trim();
  if (!query) {
    return request<{ pets: Pet[] }>(BASE);
  }
  // The dev proxy strips query strings, so search rides in the POST body.
  return request<{ pets: Pet[] }>(BASE, {
    method: "POST",
    body: JSON.stringify({ q: query }),
  });
}

export async function getPet(id: number): Promise<Pet> {
  const data = await request<{ pets: Pet[] }>(`${BASE}/${id}`);
  const pet = (data.pets || [])[0];
  if (!pet) {
    throw new Error("Pet not found");
  }
  return pet;
}

export function createPet(draft: PetDraft): Promise<{ pet: Pet }> {
  return request<{ pet: Pet }>(BASE, {
    method: "POST",
    body: JSON.stringify(draft),
  });
}

export function updatePet(id: number, fields: PetUpdate): Promise<{ pet: Pet }> {
  return request<{ pet: Pet }>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...fields }),
  });
}

export function deletePet(id: number): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`${BASE}/${id}`, { method: "DELETE" });
}
