// src/app/models/user.model.ts
export interface User {
  _id: string;
  nom: string;
  email: string;
  type: string;
  actif: boolean;
  societe?: string;
}
