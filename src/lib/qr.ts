import QRCode from "qrcode";

export function getExtintorUrl(codigo: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/extintor/${codigo}`;
}

/** PNG en formato Buffer, listo para servir con Content-Type: image/png */
export async function generarQrPng(codigo: string): Promise<Buffer> {
  const url = getExtintorUrl(codigo);
  return QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

/** Data URL (base64) para incrustar directamente en un <img src="..."> */
export async function generarQrDataUrl(codigo: string): Promise<string> {
  const url = getExtintorUrl(codigo);
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
