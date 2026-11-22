/**
 * Seller-specific storefront defaults used when the public API has no value.
 * Sellers must review these placeholders before deploying their store.
 */

// TODO(seller): Set the customer support email.
export const supportEmail = 'support@store.com';
export const serviceEmail =
  process.env.NEXT_PUBLIC_SERVICE_EMAIL || supportEmail;
// TODO(seller): Set the grievance officer email.
export const grievanceEmail = 'grievance@store.com';
// TODO(seller): Set the legal contact email.
export const legalEmail = 'legal@brandname.com';
// TODO(seller): Set the customer support phone number.
export const supportPhone = '+91 123 456 7890';
// TODO(seller): Set the grievance officer phone number.
export const grievancePhone = '+91 123 456 7891';
// TODO(seller): Set the support address shown on the contact page.
export const supportAddress = [
  '123 Business Park',
  'Mumbai, Maharashtra 400001',
  'India',
];
// TODO(seller): Set the short address shown in the footer.
export const footerAddress = 'Your City, Country';
// TODO(seller): Set the grievance officer's name.
export const grievanceOfficerName = 'Rajesh Kumar';
// TODO(seller): Match this displayed threshold to the shipping policy configured in the admin.
export const freeShippingThreshold = 999;
// TODO(seller): Set fallback branding for when SEO configuration is unavailable.
export const brandNameFallback = 'Store';
export const brandLogoFallback = '/shoppulselogo.png';
export const brandTitleFallback =
  'ShopPulse Template - Feel the Pulse of Your Business';
export const brandDescriptionFallback =
  'Its a ecommerce storefront template built with nextjs 15';
// TODO(seller): Set NEXT_PUBLIC_STORE_URL or replace this fallback with the public storefront URL.
export const storeUrlFallback = 'https://store.example.com';
