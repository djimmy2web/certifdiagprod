import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { generateUniqueCustomId, generateProfileImage } from "@/lib/user-utils";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: String(user._id),
          email: user.email,
          name: user.name ?? undefined,
          customId: user.customId,
          image: user.image,
          role: user.role,
        } as {
          id: string;
          email: string;
          name?: string;
          customId: string;
          image?: string;
          role: "user" | "admin";
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Toujours propager les informations clés depuis l'utilisateur authentifié
        token.id = (user as { id: string }).id;
        token.role = (user as { role: "user" | "admin" }).role ?? (token as { role: "user" | "admin" }).role;
        token.customId = (user as { customId: string }).customId ?? (token as { customId: string }).customId;
        token.image = (user as { image: string }).image ?? (token as { image: string }).image;
      } else if (token.id) {
        // Récupérer les données fraîches de la base de données
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.customId = dbUser.customId;
            token.image = dbUser.image;
            token.role = dbUser.role;
            (token as { name: string | undefined }).name = dbUser.name ?? undefined;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Toujours écrire les champs sur la session
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { customId: string | undefined }).customId = token.customId as string | undefined;
        (session.user as { image: string | undefined }).image = token.image as string | undefined;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Si c'est une connexion OAuth, on s'assure que l'utilisateur existe en base
      if (account?.provider !== "credentials") {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Créer un nouvel utilisateur pour les connexions OAuth
          const existingCustomIds = await User.distinct('customId').catch(() => []);
          const customId = await generateUniqueCustomId(existingCustomIds);
          const profileImage = user.image || generateProfileImage(customId);
          
          const newUser = await User.create({
            email: user.email,
            name: user.name,
            customId,
            image: profileImage,
            emailVerified: new Date(),
            role: "user",
          });
          user.id = String(newUser._id);
          if ('customId' in user) (user as { customId: string }).customId = customId;
          user.image = profileImage;
        } else {
          // Utilisateur existant, mettre à jour les informations si nécessaire
          if (!existingUser.customId) {
            const existingCustomIds = await User.distinct('customId').catch(() => []);
            const customId = await generateUniqueCustomId(existingCustomIds);
            const profileImage = existingUser.image || generateProfileImage(customId);
            await User.findByIdAndUpdate(existingUser._id, { 
              customId, 
              image: profileImage 
            });
            if ('customId' in user) (user as { customId: string }).customId = customId;
            user.image = profileImage;
          } else {
            if ('customId' in user) (user as { customId: string }).customId = existingUser.customId;
            user.image = existingUser.image;
          }
          
          if (!existingUser.image && user.image) {
            await User.findByIdAndUpdate(existingUser._id, { image: user.image });
          }
          if (!existingUser.name && user.name) {
            await User.findByIdAndUpdate(existingUser._id, { name: user.name });
          }
          user.id = String(existingUser._id);
          if ('role' in user) user.role = existingUser.role;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/connexion",
  },
};


