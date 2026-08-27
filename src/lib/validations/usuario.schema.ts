import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es requerido"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["ADMINISTRADOR", "INSPECTOR"]),
  activo: z.boolean().optional(),
});

export const usuarioUpdateSchema = usuarioSchema.partial().extend({
  password: z.string().min(6).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
