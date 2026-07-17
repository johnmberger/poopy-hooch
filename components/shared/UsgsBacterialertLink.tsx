import { Fragment, type ReactNode } from "react";

import { USGS_BACTERIA_URL } from "@/lib/bacteria/usgs";

export function UsgsBacterialertLink({ children = "USGS BacteriALERT" }: { children?: ReactNode }) {
  return (
    <a href={USGS_BACTERIA_URL} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}

export function linkifyBacterialert(text: string): ReactNode {
  const token = "USGS BacteriALERT";
  if (!text.includes(token)) return text;

  return text.split(token).map((part, index, parts) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? <UsgsBacterialertLink /> : null}
    </Fragment>
  ));
}
