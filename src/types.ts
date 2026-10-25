export type Pet = {
  id: number;
  name: string;
  species: string;
  age: string;
  emoji: string;
  blurb: string;
  interested_in: string;
  adopted_by: string;
  adopted_at: string;
  appointment_with: string;
  appointment_at: string;
  created_at?: string;
};

export type PetDraft = {
  name: string;
  species: string;
  age: string;
  emoji: string;
  blurb: string;
};

export type PetUpdate = {
  interested_in: string;
  adopted_by: string;
  adopted_at: string;
  appointment_with: string;
  appointment_at: string;
};
