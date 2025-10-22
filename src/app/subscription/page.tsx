"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XIcon } from "lucide-react";

interface PaymentField {
  id: string;
  label: string;
  placeholder: string;
}

function SubscriptionContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  // Lire le plan depuis l'URL ou utiliser "3 mois" par défaut
  const planFromUrl = searchParams.get('plan') || "3 mois";
  const [selectedPlan, setSelectedPlan] = useState(planFromUrl);
  const [selectedPrice, setSelectedPrice] = useState(planFromUrl === "1 mois" ? "20 €" : "47,97 €");

  const paymentFields: PaymentField[] = [
    {
      id: "card-number",
      label: "Numéro de carte",
      placeholder: "XXXX XXXX XXXX XXXX",
    },
    {
      id: "expiration",
      label: "Date d'expiration (MM/AA)",
      placeholder: "00/00",
    },
    {
      id: "security-code",
      label: "Code de sécurité",
      placeholder: "123",
    },
    {
      id: "country",
      label: "Pays",
      placeholder: "France",
    },
  ];

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, ''); // Enlever les espaces
    value = value.replace(/\D/g, ''); // Garder que les chiffres
    value = value.slice(0, 16); // Max 16 chiffres
    
    // Formater avec des espaces tous les 4 chiffres
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Garder que les chiffres
    value = value.slice(0, 4); // Max 4 chiffres (MMAA)
    
    // Formater MM/AA
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    e.target.value = value;
  };

  const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Garder que les chiffres
    value = value.slice(0, 4); // Max 4 chiffres (CVC/CVV)
    e.target.value = value;
  };

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/connexion");
      return;
    }
  }, [session, status, router]);

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Activer directement l'abonnement dans la base de données
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          price: selectedPrice,
          trialDays: 3
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Rediriger vers le dashboard avec un message de succès
        router.push('/?subscribed=true');
      } else {
        console.error('Erreur lors de l\'activation:', data.error);
        alert(data.error || 'Erreur lors de l\'activation de l\'abonnement');
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'essai:', error);
      alert('Erreur lors du démarrage de l\'essai gratuit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleViewAllOffers = () => {
    // Rediriger vers une page avec toutes les offres
    router.push('/tarifs');
  };

  return (
    <div className="bg-[#e8f3ff] w-full min-h-screen flex flex-col items-center">
      <header className="flex h-[122px] w-full max-w-[950px] items-center justify-between px-6 py-12">
        <div className="inline-flex items-center gap-3">
          <img
            className="h-6"
            alt="Certifdiag Pro"
            src="/certifdiagsub.svg"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 p-0 hover:bg-transparent"
          onClick={handleClose}
        >
          <XIcon className="w-3.5 h-3.5 text-[#202225]" />
        </Button>
      </header>

      <main className="inline-flex w-full max-w-[1052px] items-start gap-6 px-6">
        {/* Info abonnement */}
        <Card className="inline-flex flex-col items-start gap-12 p-8 bg-white rounded-xl border border-solid border-[#e8e8e8]">
          <CardContent className="p-0 flex flex-col gap-12">
            <section className="inline-flex items-start gap-16">
              <h2 className="w-[100px] mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[#202225] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]">
                Abonnement sélectionné :
              </h2>

              <div className="flex flex-col w-[225px] items-start gap-1.5">
                <h3 className="self-stretch mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
                  Abonnement de {selectedPlan}
                </h3>

                <Button
                  variant="link"
                  onClick={handleViewAllOffers}
                  className="h-auto p-0 font-[family-name:'Gilroy-Bold',Helvetica] font-bold text-[#0083ff] text-sm text-right tracking-[0] leading-[19.6px] hover:no-underline"
                >
                  VOIR TOUTES LES OFFRES
                </Button>
              </div>
            </section>

            <section className="inline-flex items-start gap-16">
              <h2 className="w-[100px] mt-[-1.00px] font-s-bold font-[number:var(--s-bold-font-weight)] text-[#202225] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)]">
                Facturé :
              </h2>

              <div className="flex flex-col w-[300px] items-start gap-1.5">
                <h3 className="self-stretch mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)]">
                  0 € aujourd&apos;hui
                </h3>

                <p className="self-stretch font-m-regular font-[number:var(--m-regular-font-weight)] text-[#202225] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                  {selectedPrice} {selectedPlan === "3 mois" ? "tous les 3 mois" : "par mois"} facturés après l&apos;essai gratuit de 3 jours
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        <Card className="flex flex-col w-full lg:w-[500px] items-start gap-8 p-8 bg-white rounded-xl border border-solid border-[#e8e8e8]">
          <CardContent className="p-0 w-full flex flex-col gap-8">
            <h2 className="w-fit mt-[-1.00px] font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[#202225] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] whitespace-nowrap [font-style:var(--XL-bold-font-style)]">
              Information de paiement
            </h2>

            <form onSubmit={handleStartTrial} className="flex flex-col items-start gap-6 w-full">
              {paymentFields.map((field) => {
                const getOnChangeHandler = () => {
                  switch (field.id) {
                    case 'card-number':
                      return handleCardNumberChange;
                    case 'expiration':
                      return handleExpirationChange;
                    case 'security-code':
                      return handleSecurityCodeChange;
                    default:
                      return undefined;
                  }
                };

                const getInputType = () => {
                  return field.id === 'country' ? 'text' : 'tel';
                };

                const getMaxLength = () => {
                  switch (field.id) {
                    case 'card-number':
                      return 19; // 16 chiffres + 3 espaces
                    case 'expiration':
                      return 5; // MM/AA
                    case 'security-code':
                      return 4;
                    default:
                      return undefined;
                  }
                };

                return (
                  <div
                    key={field.id}
                    className="flex flex-col h-[74px] items-start gap-1.5 w-full"
                  >
                    <Label
                      htmlFor={field.id}
                      className="self-stretch mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#484848] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]"
                    >
                      {field.label}
                    </Label>

                    <Input
                      id={field.id}
                      type={getInputType()}
                      placeholder={field.placeholder}
                      onChange={getOnChangeHandler()}
                      maxLength={getMaxLength()}
                      required
                      className="flex flex-col items-start justify-center gap-6 p-3 w-full rounded-lg border border-solid border-[#e8e8e8] font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)] h-auto"
                    />
                  </div>
                );
              })}

              <p className="self-stretch font-s-regular font-[number:var(--s-regular-font-weight)] text-[#202225] text-[length:var(--s-regular-font-size)] tracking-[var(--s-regular-letter-spacing)] leading-[var(--s-regular-line-height)] [font-style:var(--s-regular-font-style)]">
                En fournissant vos informations de carte bancaire, vous autorisez CertifDiag à débiter votre carte pour les paiements futurs conformément à ses conditions.
              </p>

                <Button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-[15px] px-8 py-3.5 w-full h-auto bg-[#0083ff] rounded-md overflow-hidden hover:bg-[#0073e6] transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="w-fit mt-[-2.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                    Commencer 3 jours gratuits
                  </span>
                )}
                </Button>
            </form>
              </CardContent>
            </Card>
      </main>

      <footer className="flex h-28 w-[500px] mt-12 flex-col items-center gap-0.5 px-4">
        <h3 className="self-stretch mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#484848] text-[length:var(--m-bold-font-size)] text-center tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
          Facturation automatique, résiliable à tout moment
        </h3>

        <p className="self-stretch font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] text-center tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
          Ton compte sera automatique débité à la fin de ton essai gratuit, au tarif de l&apos;abonnement préalablement sélectionné, sauf si tu résilies au moins 24 heurs avant la fin de ton essai gratuit. Tu peux résilier à tout moment dans les paramètres
        </p>
      </footer>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
