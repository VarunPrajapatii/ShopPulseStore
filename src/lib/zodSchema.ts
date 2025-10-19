import * as z from 'zod';

export const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  pincode: z
    .string()
    .min(6, 'Pincode must be 6 digits')
    .max(6, 'Pincode must be 6 digits')
    .regex(/^[0-9]+$/, 'Pincode must contain only digits'),
  flatHouse: z.string().min(1, 'Please enter your flat/house details'),
  areaStreet: z.string().min(10, 'Please enter your area/street'),
  landmark: z.string().optional(),
  townCity: z.string().min(3, 'Please enter your town/city'),
  state: z.string().min(3, 'Please select a state'),
});
