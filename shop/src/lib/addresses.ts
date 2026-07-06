import type { ShippingRecipient } from '../../../shared/shop-fulfillment/index';

export type UserAddress = {
  id: number;
  label?: string | null;
  name: string;
  phone: string;
  countryCode: string;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  addressLine: string;
  postalCode?: string | null;
  wristCm?: string | null;
  isDefault: boolean;
};

export function addressToRecipient(addr: UserAddress): ShippingRecipient {
  return {
    name: addr.name,
    phone: addr.phone,
    countryCode: addr.countryCode,
    province: addr.province ?? undefined,
    city: addr.city ?? undefined,
    district: addr.district ?? undefined,
    address: addr.addressLine,
    postalCode: addr.postalCode ?? undefined,
    wristCm: addr.wristCm ?? undefined,
  };
}
