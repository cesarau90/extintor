/** Ícono genérico de extintor, usado como respaldo visual cuando el
 * extintor no tiene una fotografía cargada. */
export function ExtintorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 90"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 7h10" />
      <path d="M27 7v6" />
      <rect x="18" y="13" width="18" height="10" rx="3" />
      <circle cx="40" cy="18" r="4" />
      <path d="M18 17c-6 2-10 6-11 12" />
      <path d="M16 23h22v47a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V23z" />
      <path d="M16 46h22" />
    </svg>
  );
}
