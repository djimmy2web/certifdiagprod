import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash?: string; // Optionnel pour les connexions OAuth
  name?: string;
  customId: string; // Identifiant personnalisé unique (ex: tomaterouge21)
  points?: number;
  role: "user" | "admin";
  image?: string; // URL de l'image de profil
  emailVerified?: Date;
  lives?: {
    current: number; // Nombre de vies actuelles
    max: number; // Nombre maximum de vies
    lastRegeneration: Date; // Dernière régénération de vie
    regenerationRate: number; // Heures entre chaque régénération de vie
  };
  subscription?: {
    plan: "free" | "pro" | "premium";
    status?: "trial" | "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "unpaid";
    billing_period?: "monthly" | "quarterly" | "yearly";
    trial_end?: Date;
    current_period_start?: Date;
    current_period_end?: Date;
    price?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  subscriptionStatus?: string;
  isPro?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserMethods = object;

export type UserModel = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String }, // Plus requis pour permettre les connexions OAuth
    name: { type: String },
    customId: { type: String, required: true, unique: true, index: true },
    points: { type: Number, default: 0, index: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    image: { type: String },
    emailVerified: { type: Date },
    lives: {
      current: { type: Number, default: 5, min: 0, max: 10 },
      max: { type: Number, default: 5, min: 1, max: 10 },
      lastRegeneration: { type: Date, default: Date.now },
      regenerationRate: { type: Number, default: 4 }, // 4 heures par défaut
    },
    subscription: {
      plan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
      status: { type: String },
      billing_period: { type: String, enum: ["monthly", "quarterly", "yearly"] },
      trial_end: { type: Date },
      current_period_start: { type: Date },
      current_period_end: { type: Date },
      price: { type: String },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
    },
    subscriptionStatus: { type: String },
    isPro: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", UserSchema);


