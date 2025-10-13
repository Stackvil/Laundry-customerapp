export interface Shop {
  id: string;
  name: string;
  address: string;
  distance: string;
  imageUrl: string;
  rating: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
}

export interface CartItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  shopName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'picked_up' | 'in_progress' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  pickedUpAt?: Date;
  inProgressAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  rider?: Rider;
}

export interface Rider {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  imageUrl: string;
  rating: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
}
