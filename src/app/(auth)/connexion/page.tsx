"use client";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function ConnexionPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const socialButtons = [{ label: "GOOGLE" }, { label: "FACEBOOK" }];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: username, // Utiliser le nom d'utilisateur comme email
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Identifiants invalides");
      return;
    }
    router.push("/");
  }

  async function handleOAuthSignIn(provider: string) {
    setOauthLoading(provider);
    setError(null);
    await signIn(provider, { callbackUrl: "/" });
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4 w-full">
          <img
            className="w-[101px] h-16 object-cover"
            alt="Image"
            src="https://c.animaapp.com/mgwap5rm4JZob1/img/image-13.png"
          />

          <h1 className="w-full [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#202225] text-[32px] text-center tracking-[0] leading-[38.4px]">
            Tu es de retour !
          </h1>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col items-start gap-4 w-full">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <Label className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
              Nom d&apos;utilisateur
            </Label>

            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-[46px] rounded-lg border border-solid border-[#e8e8e8]" 
              required
            />
          </div>

          <div className="flex flex-col items-start gap-1.5 w-full">
            <div className="flex items-center justify-between w-full">
              <Label className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                Mot de passe
              </Label>

              <button 
                type="button"
                className="inline-flex items-center gap-1"
                onClick={() => {
                  // TODO: Implémenter la fonctionnalité de mot de passe oublié
                  alert("Fonctionnalité de mot de passe oublié à implémenter");
                }}
              >
                <span className="[font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap">
                  OUBLIÉ ?
                </span>
              </button>
            </div>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[46px] rounded-lg border border-solid border-[#e8e8e8]"
              required
            />
          </div>

          {error && (
            <div className="w-full rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit"
            disabled={loading || oauthLoading !== null}
            className="h-[50px] w-full bg-[#0083ff] hover:bg-[#0073e6] rounded-md font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <div className="w-full font-s-regular font-[number:var(--s-regular-font-weight)] text-[#868686] text-[length:var(--s-regular-font-size)] text-center tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
          Ou
        </div>

        <div className="flex items-start gap-3 w-full h-11">
          {socialButtons.map((social, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleOAuthSignIn(social.label.toLowerCase())}
              disabled={oauthLoading !== null}
              className="h-auto flex-1 flex flex-col items-center justify-center gap-6 p-3 rounded-md border border-solid border-[#e8e8e8] bg-white hover:bg-gray-50"
            >
              {oauthLoading === social.label.toLowerCase() ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <span className="[font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap">
                  {social.label}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}


