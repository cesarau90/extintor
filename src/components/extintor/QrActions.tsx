"use client";

import { Button } from "@/components/ui/Button";

export function QrPrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      Imprimir QR
    </Button>
  );
}
