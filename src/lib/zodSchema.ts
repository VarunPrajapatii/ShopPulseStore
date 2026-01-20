import * as z from 'zod';

// Pincode validation for India (6 digits)
const pincodeSchema = z
  .string()
  .min(6, 'Pincode must be 6 digits')
  .max(6, 'Pincode must be 6 digits')
  .regex(/^[0-9]+$/, 'Pincode must contain only digits');

// Shipping address schema (always required)
const shippingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema,
  country: z.string(),
});

// Billing address schema (required only when different from shipping)
const billingAddressSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string(),
});

export const formSchema = z.object({
  // Customer information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  
  // Shipping address (required)
  shippingAddress: shippingAddressSchema,
  
  // Billing toggle
  isShippingSameAsBilling: z.boolean(),
  
  // Billing address (optional - only required when isShippingSameAsBilling is false)
  billingAddress: billingAddressSchema.optional(),
  
  // Order notes (optional)
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // If billing is different from shipping, billing address must be provided with required fields
  if (!data.isShippingSameAsBilling) {
    if (!data.billingAddress?.line1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Address line 1 is required',
        path: ['billingAddress', 'line1'],
      });
    }
    if (!data.billingAddress?.city || data.billingAddress.city.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'City is required',
        path: ['billingAddress', 'city'],
      });
    }
    if (!data.billingAddress?.state || data.billingAddress.state.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'State is required',
        path: ['billingAddress', 'state'],
      });
    }
    if (!data.billingAddress?.pincode || !/^[0-9]{6}$/.test(data.billingAddress.pincode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pincode must be 6 digits',
        path: ['billingAddress', 'pincode'],
      });
    }
  }
});

export type CheckoutFormValues = z.infer<typeof formSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type BillingAddress = z.infer<typeof billingAddressSchema>;
