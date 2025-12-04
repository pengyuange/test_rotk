export type FoodStatus = 'fresh' | 'expiring' | 'expired';

export interface Food {
  id: string;
  name: string;
  expiryDate: string;
  imageUri?: string;
  createdAt: string;
}

export interface FoodWithStatus extends Food {
  status: FoodStatus;
  daysUntilExpiry: number;
}
