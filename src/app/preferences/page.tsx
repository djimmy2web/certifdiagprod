"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { SubscriptionManagementSection } from "@/components/SubscriptionManagementSection";

interface UserPreferences {
  soundEffects: boolean;
  animations: boolean;
}

interface SubscriptionData {
  currentPlan: string;
  planName: string;
  isActive: boolean;
  isPro?: boolean;
  benefits: any;
}

const advantages = [
  "Jeux interactifs",
  "Examens blancs", 
  "Vies illimitées",
  "Pas de publicité",
  "Revue des erreurs",
];

const accountMenuItems = ["Préférences", "Profil"];
const assistanceMenuItems = ["Centre d'aide"];

function PreferencesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<UserPreferences>({
    soundEffects: true,
    animations: true
  });
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'preferences');

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/connexion");
      return;
    }

    if (session?.user) {
      loadData();
    }
  }, [session, status, router]);

  const loadData = async () => {
    try {
      // Charger les préférences
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }

      // Charger les données d'abonnement
      const subRes = await fetch("/api/me/subscription");
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success) {
          setSubscription(subData.subscription);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const handleStartTrial = async () => {
    try {
      // Rediriger vers la page de sélection d'offre
      router.push('/essai-gratuit');
    } catch (error) {
      console.error("Erreur lors du démarrage de l'essai:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderMainContent = () => {
    if (activeTab === 'subscription') {
      // Si l'utilisateur est abonné (Pro ou en période d'essai), afficher le composant de gestion d'abonnement
      if (subscription?.isPro) {
        return <SubscriptionManagementSection />;
      }
      
      // Sinon, afficher l'interface pour s'abonner
      return (
        <div className="flex flex-col flex-1 max-w-[700px] items-start gap-8">
          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0">
            <h1 className="w-full font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
              Votre accès pour réussir
            </h1>

            <Card className="w-full bg-[#f0a400] border-none rounded-xl overflow-hidden translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
              <CardContent className="flex flex-col items-start justify-center gap-6 p-6 relative">
                <img
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1124px] h-[216px] pointer-events-none"
                  alt="Decorative background pattern"
                  src="https://c.animaapp.com/mgwug0na39RdKg/img/frame-353.png"
                />

                <div className="flex flex-col items-start justify-center gap-1 w-full relative z-10">
                  <h2 className="w-fit font-l-bold font-[number:var(--l-bold-font-weight)] text-white text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    Passez au niveau supérieur avec CertifDiag Pro
                  </h2>

                  <p className="w-full font-m-regular font-[number:var(--m-regular-font-weight)] text-white text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    Transformez chaque session en un véritable entraînement gagnant.
                  </p>
                </div>

                <Button 
                  onClick={handleStartTrial}
                  className="w-full h-auto bg-white text-[#202225] hover:bg-white/90 px-8 py-3.5 rounded-md border border-solid border-[#e8e8e8] relative z-10 transition-colors"
                >
                  <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                    Commencer 3 jours gratuits
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <h2 className="w-full font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
              Les avantages de CertifDiag Pro
            </h2>

            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8]">
              <CardContent className="flex flex-col items-start justify-center gap-3 p-6">
                {advantages.map((advantage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 w-full max-w-[300px]"
                  >
                    <CheckIcon className="w-5 h-5 text-[#202225] flex-shrink-0" />
                    <span className="flex-1 font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                      {advantage}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Onglet Préférences
    return (
      <div className="flex flex-col flex-1 max-w-[700px] items-start gap-8">
        <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0">
          <h1 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
            Préférences
          </h1>
          
          <Card className="flex flex-col items-start justify-center gap-6 p-6 flex-[0_0_auto] rounded-xl relative self-stretch w-full border border-solid border-[#e8e8e8]">
            <div className="inline-flex items-center justify-center gap-2.5 pl-4 pr-0 py-0 relative flex-[0_0_auto] p-0">
              <h2 className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                Paramètres des quizs
              </h2>
            </div>

            <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto] p-0">
              {/* Effets sonores */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100 w-full">
                <div>
                  <h3 className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                    Effets sonores
                  </h3>
                  <p className="font-s-regular font-[number:var(--s-regular-font-weight)] text-[#868686] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                    Activez les sons lors des quiz
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('soundEffects', !preferences.soundEffects)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.soundEffects ? 'bg-[#0083ff]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between py-4 w-full">
                <div>
                  <h3 className="font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                    Animations
                  </h3>
                  <p className="font-s-regular font-[number:var(--s-regular-font-weight)] text-[#868686] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                    Activez les animations dans l&apos;interface
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('animations', !preferences.animations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.animations ? 'bg-[#0083ff]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.animations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pl-8 pr-4 py-8">
        <section className="flex flex-col lg:flex-row items-start gap-12 w-full">
          {renderMainContent()}

          <aside className="flex flex-col w-full lg:w-[350px] items-start gap-6">
            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
              <CardContent className="flex flex-col items-start justify-center gap-4 p-6">
                <div className="inline-flex items-center justify-center gap-2.5 pl-4 pr-0 py-0">
                  <h3 className="w-fit font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    Compte
                  </h3>
                </div>

                <nav className="flex flex-col items-start gap-0.5 w-full">
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex items-center gap-2.5 px-4 py-2 w-full rounded-lg transition-colors text-left ${
                      activeTab === 'preferences' ? 'bg-[#f2f2f2]' : 'hover:bg-[#f2f2f2]'
                    }`}
                  >
                    <span className="w-fit font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                      Préférences
                    </span>
                  </button>
                  <button
                    onClick={() => router.push('/profile-settings')}
                    className="flex items-center gap-2.5 px-4 py-2 w-full rounded-lg hover:bg-[#f2f2f2] transition-colors text-left"
                  >
                    <span className="w-fit font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                      Profil
                    </span>
                  </button>
                </nav>
              </CardContent>
            </Card>

            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
              <CardContent className="flex flex-col items-start justify-center gap-4 p-6">
                <div className="inline-flex items-center justify-center gap-2.5 pl-4 pr-0 py-0">
                  <h3 className="w-fit font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    Abonnement
                  </h3>
                </div>

                <nav className="flex flex-col items-start gap-1 w-full">
                  <button 
                    onClick={() => setActiveTab('subscription')}
                    className={`flex items-center gap-2.5 px-4 py-2 w-full rounded-lg transition-colors text-left ${
                      activeTab === 'subscription' ? 'bg-[#f2f2f2]' : 'hover:bg-[#f2f2f2]'
                    }`}
                  >
                    <span className="w-fit font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                      {subscription?.isPro ? 'Gérer mon abonnement' : 'Choisir un abonnement'}
                    </span>
                  </button>
                </nav>
              </CardContent>
            </Card>

            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
              <CardContent className="flex flex-col items-start justify-center gap-4 p-6">
                <div className="inline-flex items-center justify-center gap-2.5 pl-4 pr-0 py-0">
                  <h3 className="w-fit font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    Assistance
                  </h3>
                </div>

                <nav className="flex flex-col items-start gap-1 w-full">
                  {assistanceMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-2.5 px-4 py-2 w-full rounded-lg hover:bg-[#f2f2f2] transition-colors text-left"
                    >
                      <span className="w-fit font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                        {item}
                      </span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <PreferencesContent />
    </Suspense>
  );
}
