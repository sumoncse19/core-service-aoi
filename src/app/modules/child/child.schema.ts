import { z } from 'zod'

export const registerChildSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  date_of_birth: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  gender: z.string().optional(),
  medical_info: z.string().optional(),
  emergency_contact: z
    .object({
      name: z.string().min(2, 'Emergency contact name is required'),
      phone: z.string().min(10, 'Valid phone number is required'),
      relationship: z.string().min(2, 'Relationship is required'),
    })
    .optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const updateChildSchema = registerChildSchema.partial()
