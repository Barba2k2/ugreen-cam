import type { ReactNode } from "react";

interface ListRowDsProps {
  label: string;
  caption?: string;
  children: ReactNode;
}

/** Item row: label (and optional caption) on the left, actions on the right. */
export function ListRowDs({ label, caption, children }: ListRowDsProps) {
  return (
    <div className="list-row-ds">
      <div className="list-row-ds__text">
        <span className="list-row-ds__label">{label}</span>
        {caption && <span className="list-row-ds__caption">{caption}</span>}
      </div>
      <div className="list-row-ds__actions">{children}</div>
    </div>
  );
}
