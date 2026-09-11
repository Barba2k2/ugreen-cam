import type { ReactNode } from "react";

interface SectionDsProps {
  title: string;
  children: ReactNode;
}

export function SectionDs({ title, children }: SectionDsProps) {
  return (
    <section className="section-ds">
      <h2 className="section-ds__title">{title}</h2>
      <div className="section-ds__body">{children}</div>
    </section>
  );
}
