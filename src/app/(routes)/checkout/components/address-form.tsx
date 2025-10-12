"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/utils";

interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pincode: string;
  flatHouse: string;
  areaStreet: string;
  landmark?: string;
  townCity: string;
  state: string;
}

interface AddressFormProps {
  form: UseFormReturn<CheckoutFormValues>;
  loading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ form, loading }) => {
  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="First name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Last name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Email <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                disabled={loading}
                placeholder="your.email@example.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone Number */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Phone Number <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="tel"
                disabled={loading}
                placeholder="10-digit phone number"
                maxLength={10}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pincode */}
      <FormField
        control={form.control}
        name="pincode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Pincode <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="6-digit pincode"
                maxLength={6}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Flat/House */}
      <FormField
        control={form.control}
        name="flatHouse"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Flat, House no., Building, Company, Apartment{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="Flat, House no., Building, Company, Apartment"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Area/Street */}
      <FormField
        control={form.control}
        name="areaStreet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Area, Street, Sector, Village{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="Area, Street, Sector, Village"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Landmark */}
      <FormField
        control={form.control}
        name="landmark"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Landmark</FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="Landmark (optional)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Town/City */}
      <FormField
        control={form.control}
        name="townCity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Town/City <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={loading}
                placeholder="Town/City"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State Dropdown */}
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              State <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              disabled={loading}
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    defaultValue={field.value}
                    placeholder="Select a state"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {indianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddressForm;
