"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";

// Types pour les données d'inscription
interface RegistrationData {
  howDidYouHear: string;
  learningInterests: string[];
  learningReason: string;
  name: string;
  email: string;
  password: string;
}

// Options pour chaque étape
const howDidYouHearOptions = [
  { id: "1", label: "Centre de formation ou amis" },
  { id: "2", label: "Recherche Google" },
  { id: "3", label: "Youtube" },
  { id: "4", label: "Facebook ou Instagram" },
];

const learningOptions = [
  { id: 1, label: "Gaz" },
  { id: 2, label: "Plomb" },
  { id: 3, label: "Electricité" },
  { id: 4, label: "Termites" },
];

const reasonOptions = [
  { id: 1, label: "Me divertir" },
  { id: 2, label: "Préparer un examen" },
  { id: 3, label: "Booster ma carrière" },
  { id: 4, label: "Autres" },
];

const socialButtons = [
  { id: "google", label: "GOOGLE" },
  { id: "facebook", label: "FACEBOOK" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    howDidYouHear: "",
    learningInterests: [],
    learningReason: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
          name: registrationData.name,
          preferences: {
            howDidYouHear: registrationData.howDidYouHear,
            learningInterests: registrationData.learningInterests,
            learningReason: registrationData.learningReason,
          }
        }),
      });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const apiError = typeof data?.error === "string" ? data.error : "Inscription impossible";
      setError(apiError);
      return;
      }

      router.push("/connexion");
    } catch {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="flex flex-col w-full max-w-[550px] items-start gap-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            <img
              className="w-[101px] h-16 object-cover"
              alt="Image"
              src="https://c.animaapp.com/mgwbtr5l0qBJzJ/img/image-13.png"
            />

            <h1 className="self-stretch font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
              Comment as-tu entendu parler de CertifDiag ?
            </h1>

            <div className="w-full flex flex-col gap-4">
              {howDidYouHearOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setRegistrationData(prev => ({ ...prev, howDidYouHear: option.id }))}
                  className={`flex items-center w-full px-6 py-[18px] bg-white rounded-md border border-solid transition-colors ${
                    registrationData.howDidYouHear === option.id
                      ? 'border-[#0083ff] bg-blue-50'
                      : 'border-[#e8e8e8] hover:border-[#0083ff]'
                  }`}
                >
                  <div className="flex items-center justify-center w-6 h-6 p-0.5 rounded border border-solid border-[#868686] mr-6">
                    <span className="font-XS-bold font-[number:var(--XS-bold-font-weight)] text-[#868686] text-[length:var(--XS-bold-font-size)] tracking-[var(--XS-bold-letter-spacing)] leading-[var(--XS-bold-line-height)] [font-style:var(--XS-bold-font-style)]">
                      {option.id}
                    </span>
                  </div>
                  <span className="flex-1 text-left font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col w-full max-w-[550px] items-start gap-8 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
            <img
              className="w-[101px] h-16 object-cover"
              alt="Image"
              src="https://c.animaapp.com/mgwc569k0L8stp/img/image-13.png"
            />

            <h1 className="w-full font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
              Que veux-tu apprendre ?
            </h1>

            <div className="w-full flex flex-col gap-4">
              {learningOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => {
                    const isSelected = registrationData.learningInterests.includes(option.label);
                    setRegistrationData(prev => ({
                      ...prev,
                      learningInterests: isSelected
                        ? prev.learningInterests.filter(item => item !== option.label)
                        : [...prev.learningInterests, option.label]
                    }));
                  }}
                  className={`flex w-full items-center justify-center gap-6 px-6 py-[18px] bg-white rounded-md border border-solid transition-colors relative translate-y-[-1rem] animate-fade-in opacity-0 ${
                    registrationData.learningInterests.includes(option.label)
                      ? "border-[#0083ff] bg-blue-50"
                      : "border-[#e8e8e8] hover:border-[#0083ff]"
                  }`}
                  style={{
                    "--animation-delay": `${400 + index * 100}ms`,
                  } as React.CSSProperties}
                >
                  <span className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    {option.label}
                  </span>

                  <div className="flex items-center justify-center w-6 h-6 gap-2.5 p-0.5 absolute left-[15px] rounded border border-solid border-[#868686]">
                    <span className="font-XS-bold font-[number:var(--XS-bold-font-weight)] text-[#868686] text-[length:var(--XS-bold-font-size)] tracking-[var(--XS-bold-letter-spacing)] leading-[var(--XS-bold-line-height)] [font-style:var(--XS-bold-font-style)]">
                      {option.id}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col w-full max-w-[550px] items-start gap-8">
            <img
              className="w-[101px] h-16 object-cover"
              alt="Image"
              src="https://c.animaapp.com/mgwcqvhcGglMup/img/image-13.png"
            />

            <h1 className="w-full font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
              Pourquoi veux-tu apprendre {registrationData.learningInterests.length > 0 ? `"${registrationData.learningInterests[0]}"` : "ces thématiques"} ?
            </h1>

            <div className="flex flex-col w-full gap-4">
              {reasonOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => setRegistrationData(prev => ({ ...prev, learningReason: option.label }))}
                  className={`flex items-center justify-center gap-6 px-6 py-[18px] w-full bg-white rounded-md border border-solid transition-colors relative translate-y-[-1rem] animate-fade-in opacity-0 ${
                    registrationData.learningReason === option.label
                      ? "border-[#0083ff] bg-blue-50"
                      : "border-[#e8e8e8] hover:border-[#0083ff]"
                  }`}
                  style={{
                    "--animation-delay": `${400 + index * 100}ms`,
                  } as React.CSSProperties}
                >
                  <Badge
                    variant="outline"
                    className="flex items-center justify-center w-6 h-6 p-0.5 rounded border border-solid border-[#868686] bg-transparent absolute left-[15px] top-1/2 -translate-y-1/2"
                  >
                    <span className="font-XS-bold font-[number:var(--XS-bold-font-weight)] text-[#868686] text-[length:var(--XS-bold-font-size)] tracking-[var(--XS-bold-letter-spacing)] leading-[var(--XS-bold-line-height)] [font-style:var(--XS-bold-font-style)]">
                      {option.id}
                    </span>
                  </Badge>
                  <span className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col w-full max-w-[550px] items-start gap-8">
            <img
              className="w-[121px] h-24 object-cover translate-y-[-1rem] animate-fade-in opacity-0"
              alt="Element"
              src="https://c.animaapp.com/mgwcvth8pHWyEb/img/41c05011-c5b1-44d6-91e1-9e9062241f3d-1.png"
            />

            <h1 className="w-[300px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] text-center tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
              C&apos;est le moment de créer ton profil !
            </h1>

            <div className="flex-col items-start gap-2 self-stretch w-full flex translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              <Input
                type="text"
                placeholder="Nom"
                value={registrationData.name}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                className="flex flex-col items-start justify-center gap-6 p-3 self-stretch w-full rounded-lg border border-solid border-[#e8e8e8] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)] h-auto"
                required
              />
              <Input
                type="email"
                placeholder="Adresse mail"
                value={registrationData.email}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                className="flex flex-col items-start justify-center gap-6 p-3 self-stretch w-full rounded-lg border border-solid border-[#e8e8e8] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)] h-auto"
                required
              />
              <Input
              type="password"
                placeholder="Mot de passe"
                value={registrationData.password}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                className="flex flex-col items-start justify-center gap-6 p-3 self-stretch w-full rounded-lg border border-solid border-[#e8e8e8] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)] h-auto"
              required
            />
          </div>
          
          {error && (
              <div className="w-full rounded-md bg-red-50 p-4 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
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
              onClick={handleSubmit}
              disabled={loading || !registrationData.name || !registrationData.email || !registrationData.password}
              className="flex items-center justify-center gap-[15px] px-8 py-3.5 self-stretch w-full bg-[#0083ff] rounded-md overflow-hidden h-auto hover:bg-[#0083ff]/90 transition-colors translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                  Créer un compte
                </span>
              )}
            </Button>

            <div className="flex-col w-[350px] items-start gap-1.5 flex translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
              <p className="self-stretch font-s-regular font-[number:var(--s-regular-font-weight)] text-[#868686] text-[length:var(--s-regular-font-size)] text-center tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                Ou
              </p>

              <div className="items-start gap-3 self-stretch w-full flex">
                {socialButtons.map((social) => (
                  <Button
                    key={social.id}
                    variant="outline"
                    className="flex flex-col items-center justify-center gap-6 p-3 flex-1 grow rounded-md border border-solid border-[#e8e8e8] h-auto hover:bg-accent transition-colors"
                  >
                    <span className="[font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap">
                      {social.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white w-full min-h-screen flex flex-col"
      data-model-id="446:3657"
    >
      <header className="w-full px-[245px] pt-12 pb-0 translate-y-[-1rem] animate-fade-in opacity-0">
        <div className="flex items-center justify-between w-full max-w-[950px] mx-auto">
          <img
            className="w-12 h-12"
            alt="Group"
            src="https://c.animaapp.com/mgwbtr5l0qBJzJ/img/group-816.png"
          />

          <div className="flex items-center gap-[18px] w-[600.77px]">
            <div className="flex-1 h-1.5 bg-[#f2f2f2] rounded-[1000px] overflow-hidden">
              <div 
                className="h-full bg-[#0083ff] rounded-[1000px] transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0 hover:bg-transparent"
            onClick={() => router.push("/")}
          >
            <XIcon className="w-3.5 h-3.5 text-[#202225]" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        {renderStep()}
      </main>

      <footer className="w-full px-[170px] py-12 border-t border-solid border-[#e8e8e8]">
        <div className="flex items-center justify-between w-full max-w-[1100px] mx-auto">
          {currentStep > 1 && (
            <Button 
              variant="outline"
              onClick={handleBack}
              className="h-auto px-8 py-3.5 rounded-md"
            >
              <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                Retour
              </span>
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !registrationData.howDidYouHear) ||
                (currentStep === 2 && registrationData.learningInterests.length === 0) ||
                (currentStep === 3 && !registrationData.learningReason)
              }
              className="h-auto px-8 py-3.5 bg-[#0083ff] hover:bg-[#0073e6] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-white-certifdiag text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                Continuer
              </span>
            </Button>
          ) : null}
      </div>
      </footer>
    </div>
  );
}


