"use client";

import { CheckIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useRouter } from "next/navigation";

interface PaymentMethod {
  brand: string;
  last4: string;
}

interface SubscriptionData {
  currentPlan: string;
  planName: string;
  nextPayment: string | null;
  nextPaymentDate: string | null;
  nextPaymentAmount: number;
  subscriptionDuration?: string;
  paymentMethod: PaymentMethod | null;
  isActive: boolean;
  isPro: boolean;
  benefits: string[];
  stripeCustomerId?: string;
}

const advantages = [
  { text: "Jeux interactifs" },
  { text: "Examens blancs" },
  { text: "Vies illimitées" },
  { text: "Pas de publicité" },
  { text: "Revue des erreurs" },
];



export const SubscriptionManagementSection = (): JSX.Element => {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await fetch("/api/me/subscription");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubscription(data.subscription);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'abonnement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) {
      return;
    }

    setCancelLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      alert("Erreur lors de l'annulation de l'abonnement");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ouverture du portail de paiement");
    }
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center w-full py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0083ff]"></div>
        <p className="mt-4 text-[#868686]">Chargement...</p>
      </section>
    );
  }

  // Si pas d'abonnement ou abonnement gratuit
  // isPro inclut les utilisateurs en trial et actifs
  const isSubscribed = subscription?.isPro && subscription?.currentPlan !== 'free';

  return (
    <section className="flex flex-col lg:flex-row items-start gap-12 w-full">
      <div className="flex flex-col w-full lg:w-[700px] items-start gap-8">
        <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
          <h1 className="font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
            Gérer mon abonnement
          </h1>

          {isSubscribed && (
            <Card className="w-full bg-[#f0a400] border-0 rounded-xl overflow-hidden relative">
              <CardContent className="flex flex-col items-start justify-center gap-6 px-6 py-8 relative z-10">
                <img
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1124px] h-[216px] z-0"
                  alt="Frame"
                  src="https://c.animaapp.com/mgxrpzw6OZwMhd/img/frame-353.png"
                />

                <div className="flex flex-col items-start justify-center gap-1 w-full relative z-10">
                  <h2 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-white text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                    Tu apprends avec {subscription?.planName}
                  </h2>

                  <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-white text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    Dis adieu aux pubs, et soutiens notre mission.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <h2 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
            Les avantages de CertifDiag Pro
          </h2>

          <Card className="w-full rounded-xl border border-solid border-[#e8e8e8]">
            <CardContent className="gap-3 flex flex-col items-start justify-center p-6">
              {advantages.map((advantage, index) => (
                <div key={index} className="flex w-full max-w-[300px] items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-[#0083ff]" />
                  <span className="flex-1 font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    {advantage.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {isSubscribed ? (
          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <h2 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
              Détails de l&apos;abonnement
            </h2>

            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8]">
              <CardContent className="gap-8 flex flex-col items-start justify-center p-6">
                {/* Abonnement actuel */}
                <div className="flex flex-col items-start gap-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                      Abonnement actuel
                    </h3>

                    <Button
                      variant="ghost"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      <span className="[font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline">
                        {cancelLoading ? "CHARGEMENT..." : "ANNULER MON ABONNEMENT"}
                      </span>
                    </Button>
                  </div>
            
                  <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                    Abonnement de {subscription?.subscriptionDuration || '1 mois'} à {subscription?.planName}
                  </p>
                </div>

                {/* Prochain paiement */}
                {subscription?.nextPaymentDate && (
                  <div className="flex flex-col items-start gap-3 w-full">
                    <div className="flex items-center gap-4 w-full">
                      <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                        Prochain paiement
                      </h3>
                    </div>

                    <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                      {subscription?.subscriptionDuration || '1 mois'} d&apos;abonnement {subscription?.planName} (soit {subscription?.nextPaymentAmount?.toFixed(2)} €) te {subscription?.currentPlan === 'trial' ? 'sera facturé' : 'seront facturés'} le {subscription?.nextPaymentDate}
                    </p>
                  </div>
                )}

                {/* Mode de paiement */}
                {subscription?.paymentMethod && (
                  <div className="flex flex-col items-start gap-3 w-full">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
                        Mode de paiement
                      </h3>

                      <Button
                        variant="ghost"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={handleUpdatePaymentMethod}
                      >
                        <span className="[font-family:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] whitespace-nowrap hover:underline">
                          METTRE À JOUR LE MODE DE PAIEMENT
                        </span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 w-full">
                      <div className="inline-flex flex-col items-center justify-center gap-2.5 p-1.5 px-3 bg-[#0056a3] rounded">
                        <span className="text-white font-bold text-xs">
                          {subscription.paymentMethod.brand}
                        </span>
                      </div>

                      <span className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] whitespace-nowrap [font-style:var(--m-regular-font-style)]">
                        {subscription.paymentMethod.brand} se terminant par {subscription.paymentMethod.last4}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-6 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <h2 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
              Passer à Pro
            </h2>

            <Card className="w-full rounded-xl border border-solid border-[#e8e8e8]">
              <CardContent className="gap-6 flex flex-col items-start justify-center p-6">
                <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                  Vous n&apos;avez pas encore d&apos;abonnement actif. Découvrez tous les avantages de CertifDiag Pro !
                </p>

                <Button
                  onClick={() => router.push("/subscription")}
                  className="bg-[#0083ff] hover:bg-[#0066cc] text-white px-6 py-3 rounded-lg font-bold"
                >
                  Voir les offres d&apos;abonnement
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

