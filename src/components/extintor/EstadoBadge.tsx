import { Badge } from "@/components/ui/Badge";
import type { EstadoInfo } from "@/lib/estado";

export function EstadoBadge({ estadoInfo }: { estadoInfo: EstadoInfo }) {
  return (
    <Badge color={estadoInfo.color}>
      <span>{estadoInfo.emoji}</span>
      {estadoInfo.label}
    </Badge>
  );
}
