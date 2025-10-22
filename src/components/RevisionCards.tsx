"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RevisionCard {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
}

interface RevisionCardsProps {
  cards: RevisionCard[];
}

const RevisionCards: React.FC<RevisionCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[600px]">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          className="w-full bg-[#f9f9f9] border-[#e8e8e8] shadow-[0px_0px_0px_#0083ff40] translate-y-[-1rem] animate-fade-in opacity-0 hover:shadow-lg transition-shadow duration-300"
          style={{
            "--animation-delay": `${(index + 1) * 200}ms`,
          } as React.CSSProperties}
        >
          <CardContent className="flex flex-col items-start justify-center gap-6 p-6">
            <div className="flex flex-col items-start gap-4 w-full">
              <div className="flex w-[41px] h-[41px] items-center justify-center gap-2.5 p-2 bg-[#0083ff] rounded-md">
                <img
                  className="flex-1 self-stretch grow"
                  alt={card.iconAlt}
                  src={card.iconSrc}
                />
              </div>

              <div className="flex flex-col items-start gap-1.5 w-full">
                <h3 className="font-l-bold font-[number:var(--l-bold-font-weight)] text-[#202225] text-[length:var(--l-bold-font-size)] tracking-[var(--l-bold-letter-spacing)] leading-[var(--l-bold-line-height)] [font-style:var(--l-bold-font-style)]">
                  {card.title}
                </h3>

                <p className="font-m-regular font-[number:var(--m-regular-font-weight)] text-[#484848] text-[length:var(--m-regular-font-size)] tracking-[var(--m-regular-letter-spacing)] leading-[var(--m-regular-line-height)] [font-style:var(--m-regular-font-style)]">
                  {card.description}
                </p>
              </div>
            </div>

            <Link href={card.href} className="w-full">
              <Button className="w-full h-auto bg-[#0083ff] hover:bg-[#0083ff]/90 text-white px-6 py-2 rounded-md font-s-bold font-[number:var(--s-bold-font-weight)] text-[length:var(--s-bold-font-size)] tracking-[var(--s-bold-letter-spacing)] leading-[var(--s-bold-line-height)] [font-style:var(--s-bold-font-style)] transition-colors">
                {card.buttonText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RevisionCards;
