"use client";
import { XIcon } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const subscriptionOptions = [
  {
    duration: "3 mois",
    price: "15,99 € / mois",
    totalPrice: "47,97 €",
    value: "3 mois",
  },
  {
    duration: "1 mois",
    price: "19,99 € / mois",
    totalPrice: "20 €",
    value: "1 mois",
  },
];

export default function EssaiGratuitPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("3 mois");

  const handleClose = () => {
    router.push('/');
  };

  const handleContinue = () => {
    // Rediriger vers la page de subscription avec le plan sélectionné
    router.push(`/subscription?plan=${encodeURIComponent(selectedPlan)}`);
  };

  const selectedOption = subscriptionOptions.find(opt => opt.value === selectedPlan);

  return (
    <main className="bg-[#e8f3ff] w-full min-h-screen flex flex-col">
      <header className="flex items-center justify-center px-6 py-12 relative">
        <div className="flex w-full max-w-[950px] items-center justify-between">
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
            className="w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
            aria-label="Close"
            onClick={handleClose}
          >
            <XIcon className="w-5 h-5 text-[#202225]" />
          </Button>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="flex flex-col w-full max-w-[500px] items-center gap-16">
          <h1 className="w-full max-w-[450px] [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#202225] text-[32px] text-center tracking-[0] leading-[44.8px]">
            Choisis l&apos;offre qui suivra ton essai gratuit de 3 jours
          </h1>

          <div className="flex flex-col items-start gap-3 w-full">
            {subscriptionOptions.map((option) => {
              const is3Mois = option.value === "3 mois";
              const isSelected = selectedPlan === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedPlan(option.value)}
                  className={`flex w-full items-center justify-between px-6 py-8 rounded-xl overflow-hidden transition-all ${
                    is3Mois
                      ? isSelected
                        ? "shadow-[0px_0px_0px_4px_#f0a40040] bg-[#F0A400] relative"
                        : "bg-[#F0A400] opacity-50 hover:opacity-70 relative"
                      : isSelected
                      ? "bg-white border-2 border-solid border-[#0083ff] shadow-[0px_0px_0px_4px_#0083ff40]"
                      : "bg-white border border-solid border-[#e8e8e8] opacity-50 hover:opacity-70 hover:border-[#0083ff] hover:shadow-[0px_0px_0px_4px_#0083ff40]"
                  }`}
                >
                  {isSelected && is3Mois && (
                    <div className="absolute inset-0 w-full h-full opacity-10 bg-white" />
                  )}
                  <span
                    className={`relative font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)] ${
                      is3Mois ? "text-white" : "text-[#0083ff]"
                    }`}
                  >
                    {option.duration}
                  </span>
                  <span
                    className={`relative font-XL-bold font-[number:var(--XL-bold-font-weight)] text-[length:var(--XL-bold-font-size)] tracking-[var(--XL-bold-letter-spacing)] leading-[var(--XL-bold-line-height)] [font-style:var(--XL-bold-font-style)] ${
                      is3Mois ? "text-white" : "text-[#0083ff]"
                    }`}
                  >
                    {option.price}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col w-full max-w-[456px] items-center justify-center gap-6">
            <p className="w-full font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] text-center tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
              3 jours d&apos;essai gratuit, puis {selectedOption?.totalPrice} {selectedPlan === "3 mois" ? "tous les 3 mois" : "par mois"} hors taxes
            </p>

            <Button 
              onClick={handleContinue}
              className="w-full max-w-[436px] h-[50px] items-center justify-center gap-[15px] px-8 py-3.5 bg-[#0083ff] hover:bg-[#0073e6] rounded-md transition-colors"
            >
              <span className="font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] [font-style:var(--m-bold-font-style)]">
                Commencer 3 jours gratuits
              </span>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

