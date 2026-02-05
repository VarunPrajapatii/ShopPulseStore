"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { indianStates } from "@/lib/utils";
import { CheckoutFormValues } from "@/lib/zodSchema";
import { MapPin, Receipt, Lock } from "lucide-react";
import useShipping from "@/hooks/use-shipping";

interface AddressFormProps {
  form: UseFormReturn<CheckoutFormValues>;
  loading: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ form, loading }) => {
  const { shippingData } = useShipping();
  
  // Watch the billing toggle to show/hide billing address form
  const isShippingSameAsBilling = useWatch({
    control: form.control,
    name: "isShippingSameAsBilling",
    defaultValue: true,
  });

  // Pre-fill pincode from shipping data if available
  useEffect(() => {
    if (shippingData?.pincode) {
      form.setValue("shippingAddress.pincode", shippingData.pincode);
    }
  }, [shippingData?.pincode, form]);

  // Check if pincode has been verified
  const hasPincodeFromShipping = !!shippingData?.pincode;

  return (
    <div className="space-y-8">
      {/* Customer Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Contact Information
        </h3>
        
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
      </div>

      {/* Shipping Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Shipping Address
        </h3>

        {/* Address Line 1 */}
        <FormField
          control={form.control}
          name="shippingAddress.line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Address Line 1 <span className="text-red-500">*</span>
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

        {/* Address Line 2 */}
        <FormField
          control={form.control}
          name="shippingAddress.line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Area, Street, Sector, Village, Landmark (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City and State Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shippingAddress.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="City"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingAddress.state"
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

        {/* Pincode and Country Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shippingAddress.pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Pincode <span className="text-red-500">*</span>
                  {hasPincodeFromShipping && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                      <Lock className="h-3 w-3" />
                      <span>Change in order summary</span>
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={loading || hasPincodeFromShipping}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={hasPincodeFromShipping ? "bg-muted cursor-not-allowed" : ""}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingAddress.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="India"
                    {...field}
                    value={field.value || "India"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Billing Address Toggle */}
      <div className="border-t pt-6">
        <FormField
          control={form.control}
          name="isShippingSameAsBilling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-medium cursor-pointer">
                  Billing address is same as shipping address
                </FormLabel>
                <p className="text-sm text-gray-500">
                  Uncheck if your billing address is different from your shipping address
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Billing Address Section (Conditional) */}
      {!isShippingSameAsBilling && (
        <div className="space-y-4 border-t pt-6 animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Billing Address
          </h3>

          {/* Billing Name and Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingAddress.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Name for billing (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingAddress.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      disabled={loading}
                      placeholder="Phone for billing (optional)"
                      maxLength={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Billing Address Line 1 */}
          <FormField
            control={form.control}
            name="billingAddress.line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address Line 1 <span className="text-red-500">*</span>
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

          {/* Billing Address Line 2 */}
          <FormField
            control={form.control}
            name="billingAddress.line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Area, Street, Sector, Village, Landmark (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Billing City and State Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="City"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingAddress.state"
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

          {/* Billing Pincode and Country Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="billingAddress.pincode"
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

            <FormField
              control={form.control}
              name="billingAddress.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="IN"
                      {...field}
                      value={field.value || "IN"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
