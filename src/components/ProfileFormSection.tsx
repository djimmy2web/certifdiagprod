"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface UserProfile {
  email: string;
  name?: string;
  customId: string;
  image: string;
  points: number;
  role: string;
  createdAt: string;
}

export const ProfileFormSection = (): JSX.Element => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [customId, setCustomId] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/me/profile");
      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.user);
        setCustomId(data.user.customId);
        setName(data.user.name || "");
      } else {
        setError(data.error || "Erreur lors du chargement du profil");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customId: customId.trim(),
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setProfile(data.user);
        await update();
      } else {
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      // Implémenter la suppression du compte
      console.log("Suppression du compte demandée");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Form field data
  const formFields = [
    {
      label: "Nom",
      value: profile.name || "Non renseigné",
      type: "display",
    },
    {
      label: "Nom d'utilisateur",
      value: profile.customId || "Non défini",
      type: "display",
    },
    {
      label: "E-mail",
      value: profile.email || "Non renseigné",
      type: "display",
    },
    {
      label: "Mot de passe actuel",
      value: currentPassword,
      type: "password",
    },
    {
      label: "Nouveau mot de passe",
      value: newPassword,
      type: "password",
    },
  ];

  // Navigation sections data
  const navigationSections = [
    {
      title: "Compte",
      items: [
        { label: "Préférences", active: false, onClick: () => router.push('/preferences') },
        { label: "Profil", active: true, onClick: () => {} },
      ],
    },
    {
      title: "Abonnement",
      items: [{ label: "Modifier mon abonnement", active: false, onClick: () => router.push('/subscription') }],
    },
    {
      title: "Assistance",
      items: [
        { label: "Centre d'aide", active: false, onClick: () => router.push('/aide') },
        { label: "Remarques", active: false, onClick: () => router.push('/contact') },
      ],
    },
  ];

  return (
    <div className="inline-flex h-auto w-full relative items-start gap-12 translate-y-[-1rem] animate-fade-in opacity-0">
      <div className="flex flex-col w-[600px] items-start gap-6 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-6 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col w-[115px] items-start gap-1.5 relative flex-[0_0_auto]">
            <Label className="relative self-stretch mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
              Avatar
            </Label>

            <div className="relative w-28 h-24">
              <Avatar className="absolute top-0 left-0 w-24 h-24">
                <AvatarImage
                  src={profile.image || "https://c.animaapp.com/mg80kq54grX4Hq/img/rectangle-52.svg"}
                  alt="Profile avatar"
                  className="object-cover"
                />
                <AvatarFallback>
                  {profile.customId?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Button
                type="button"
                size="sm"
                className="flex w-9 h-9 items-center gap-2.5 p-1.5 absolute top-[30px] left-[78px] bg-[#0083ff] rounded-lg border-2 border-solid border-white hover:bg-[#0083ff]/90"
              >
                <img
                  className="relative flex-1 self-stretch grow"
                  alt="Random"
                  src="https://c.animaapp.com/mg80kq54grX4Hq/img/random.svg"
                />
              </Button>
            </div>
          </div>

          {formFields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col items-start gap-1.5 relative self-stretch w-full flex-[0_0_auto]"
            >
              <Label className="relative self-stretch mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                {field.label}
              </Label>

              {field.type === "display" ? (
                <div className="flex flex-col items-start justify-center gap-6 p-3 flex-[0_0_auto] rounded-lg relative self-stretch w-full border border-solid border-[#e8e8e8]">
                  <div className="relative w-fit mt-[-1.00px] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                    {field.value}
                  </div>
                </div>
              ) : (
                <Input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => {
                    if (field.label === "Mot de passe actuel") {
                      setCurrentPassword(e.target.value);
                    } else if (field.label === "Nouveau mot de passe") {
                      setNewPassword(e.target.value);
                    }
                  }}
                  className="h-[46px] rounded-lg relative self-stretch w-full border border-solid border-[#e8e8e8]"
                />
              )}
            </div>
          ))}

          <Button 
            type="submit"
            disabled={updating}
            className="inline-flex h-auto items-center justify-center gap-[15px] px-8 py-3.5 relative bg-[#0083ff] rounded-md overflow-hidden hover:bg-[#0083ff]/90 disabled:opacity-50"
          >
            <div className="relative w-fit mt-[-2.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
              {updating ? "Enregistrement..." : "Enregistrer les modifications"}
            </div>
          </Button>
        </form>

        <Button
          onClick={handleDeleteAccount}
          variant="ghost"
          className="inline-flex items-center gap-1 relative flex-[0_0_auto] h-auto p-0 hover:bg-transparent"
        >
          <div className="relative w-fit mt-[-1.00px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#ff4b4b] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap">
            SUPPRIMER MON COMPTE
          </div>
        </Button>
      </div>

      <div className="flex flex-col w-[300px] items-start gap-6 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
        {navigationSections.map((section) => (
          <Card
            key={section.title}
            className="flex flex-col items-start justify-center gap-4 p-6 flex-[0_0_auto] rounded-xl relative self-stretch w-full border border-solid border-[#e8e8e8]"
          >
            <CardHeader className="inline-flex items-center justify-center gap-2.5 pl-4 pr-0 py-0 relative flex-[0_0_auto] p-0">
              <CardTitle className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                {section.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-start gap-0.5 relative self-stretch w-full flex-[0_0_auto] p-0">
              {section.items.map((item) => (
                <Button
                  key={item.label}
                  onClick={item.onClick}
                  variant="ghost"
                  className={`flex items-center gap-2.5 px-4 py-2 relative self-stretch w-full flex-[0_0_auto] rounded-lg h-auto justify-start ${
                    item.active
                      ? "bg-[#e8f3ff] hover:bg-[#e8f3ff]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative w-fit mt-[-1.00px] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                    {item.label}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 z-50">
          <div className="flex">
            <div className="text-red-400">❌</div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 z-50">
          <div className="flex">
            <div className="text-green-400">✅</div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
