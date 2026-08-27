import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UsuariosManager } from "@/components/usuarios/UsuariosManager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getSession();
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    orderBy: { nombre: "asc" },
  });

  return <UsuariosManager usuarios={usuarios} usuarioActualId={session!.sub} />;
}
