import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  companyId: z.number().int().optional(),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  companyName: z.string().min(2, { message: 'El nombre de la empresa es requerido' }),
});
