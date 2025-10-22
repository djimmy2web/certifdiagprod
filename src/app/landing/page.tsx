"use client";
import React from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

const diagnosticCategories = [
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/elect.svg",
    label: "Électricité",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/gaz.svg",
    label: "Gaz",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/plomb.svg",
    label: "Plomb",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/termite.svg",
    label: "Termites",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/audit.svg",
    label: "Audit énergétique",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/dpe.svg",
    label: "DPE",
  },
  {
    icon: "https://c.animaapp.com/mgw9mycglcbHc8/img/amiante.svg",
    label: "Amiante",
  },
];

export default function LandingPage(): JSX.Element {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleAlreadyHaveAccount = () => {
    router.push("/connexion");
  };

  return (
    <main
      className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-[153px]"
      data-model-id="329:2503"
    >
      <section className="flex w-full h-[399px] relative items-center justify-between">
        <div className="relative w-[408px] h-[399px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms]">
          <img
            className="absolute top-8 left-0 w-[408px] h-[367px]"
            alt="Image"
            src="https://c.animaapp.com/mgw9mycglcbHc8/img/image-82.png"
          />

          <img
            className="absolute top-0 left-8 w-[101px] h-16 object-cover"
            alt="Image"
            src="https://c.animaapp.com/mgw9mycglcbHc8/img/image-13.png"
          />
        </div>

        <div className="flex flex-col w-[444px] items-center gap-8 relative translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          <img
            className="relative w-[146px] h-6"
            alt="Certifdiag fr"
            src="https://c.animaapp.com/mgw9mycglcbHc8/img/certifdiag-fr.svg"
          />

          <h1 className="relative self-stretch [font-family:'Gilroy-Bold',Helvetica] font-bold text-[#202225] text-[32px] text-center tracking-[0] leading-[38.4px]">
            Améliores tes connaissances sur le diagnostic immobilier en jouant !
          </h1>

          <div className="flex flex-col w-[350px] items-start gap-2 relative flex-[0_0_auto]">
            <Button 
              onClick={handleGetStarted}
              className="h-[50px] items-center justify-center gap-[15px] px-8 py-3.5 relative self-stretch w-full bg-[#0083ff] rounded-md overflow-hidden hover:bg-[#0073e6] transition-colors"
            >
              <span className="relative w-fit mt-[-2.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-white text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                C&#39;est parti !
              </span>
            </Button>

            <Button
              onClick={handleAlreadyHaveAccount}
              variant="outline"
              className="h-[50px] items-center justify-center gap-[15px] px-8 py-3.5 relative self-stretch w-full bg-white rounded-md overflow-hidden border border-solid border-[#e8e8e8] hover:bg-gray-50 transition-colors"
            >
              <span className="relative w-fit mt-[-1.00px] font-m-bold font-[number:var(--m-bold-font-weight)] text-[#202225] text-[length:var(--m-bold-font-size)] tracking-[var(--m-bold-letter-spacing)] leading-[var(--m-bold-line-height)] whitespace-nowrap [font-style:var(--m-bold-font-style)]">
                J&#39;ai déjà un compte
              </span>
            </Button>
          </div>
        </div>

        <img
          className="absolute top-[137px] left-[184px] w-[189px] h-[93px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]"
          alt="Frame"
          src="https://c.animaapp.com/mgw9mycglcbHc8/img/frame-53.svg"
        />

        <img
          className="absolute top-[264px] left-[313px] w-[149px] h-[93px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:600ms]"
          alt="Frame"
          src="https://c.animaapp.com/mgw9mycglcbHc8/img/frame-987.svg"
        />
      </section>

      <nav
        className="flex w-full h-[25px] relative items-center justify-between translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]"
        aria-label="Diagnostic categories"
      >
        {diagnosticCategories.map((category, index) => (
          <button
            key={index}
            className="inline-flex items-center justify-center gap-3 relative flex-[0_0_auto] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex w-6 h-6 items-center justify-center gap-2.5 p-1 relative bg-[#0083ff] rounded-md">
              <img
                className="relative flex-1 self-stretch grow"
                alt={category.label}
                src={category.icon}
              />
            </div>

            <span className="relative w-fit mt-[-1.00px] font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] whitespace-nowrap [font-style:var(--l-bold-font-style)]">
              {category.label}
            </span>
          </button>
        ))}
      </nav>
    </main>
  );
}
