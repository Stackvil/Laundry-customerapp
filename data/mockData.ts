import { Shop, Service, ServiceCategory } from '@/types';

export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Clean & Press',
    address: '123 Main St, Anytown',
    distance: '0.5 mi away',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/mumbai/r8/022pxx22.xx22.250402190705.i6r8/catalogue/clean-press-laundry-and-dry-cleaning-versova-mumbai-dry-cleaners-3aaual7117.jpg',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'The Laundry Room',
    address: '456 Elm St, Anytown',
    distance: '1.2 mi away',
    imageUrl: 'https://content.jdmagicbox.com/comp/guwahati/u6/9999px361.x361.180611154614.m8u6/catalogue/the-laundry-room-hengrabari-road-hengrabari-guwahati-wall-putty-manufacturers-birla-white-i9hp9spjid.jpg',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Quick Wash',
    address: '789 Oak Ave, Anytown',
    distance: '0.8 mi away',
    imageUrl: 'https://content.jdmagicbox.com/comp/hubli/m4/0836px836.x836.170907194529.v4m4/catalogue/quick-wash-sirur-park-hubli-home-delivery-laundry-services-q6ljq0j1xv.jpg',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Fresh Fold',
    address: '101 Pine Ln, Anytown',
    distance: '1.5 mi away',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/hyderabad/g1/040pxx40.xx40.180528173427.r7g1/catalogue/fresh-fold-laundry-services-hyderabad-0dgemkk3td-250.jpg',
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Spotless Laundry',
    address: '222 Maple Dr, Anytown',
    distance: '1.0 mi away',
    imageUrl: 'https://content3.jdmagicbox.com/v2/comp/chandannagar/f5/9999pxx33.xx33.240314121638.t9f5/catalogue/spotless-laundry-hatkhola-chandannagar-laundry-services-2qy3fwhj0u.jpg',
    rating: 4.5,
  },
];

export const serviceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Washing',
    imageUrl: 'https://www.marthastewart.com/thmb/f8uiDKgmkjPE1a8nXK6rUOp_NWw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/comprehensive-guide-to-washing-clothes-brights-getty-0923-ad752176fd5f47b3bbb0862480d99d8f.jpg',
  },
  {
    id: '2',
    name: 'Ironing',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM88Dx39U9RZi-QePyGtzTFivjMSYMvyeNFQ&s',
  },
  {
    id: '3',
    name: 'Wash & Fold',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1-xBY4k0aWoXt-T3bsmVaNVvX_KeE9evmxg&s',
  },
  {
    id: '4',
    name: 'Premium Dry Clean',
    imageUrl: 'https://static.wixstatic.com/media/nsplsh_07cd52111656477591f8c79ea1056774~mv2.jpg/v1/fill/w_824,h_888,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20SeongMin%20Park.jpg',
  },
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Shirts',
    price: 30,
    unit: 'piece',
    imageUrl: 'https://cottonfolk.in/cdn/shop/files/99.jpg?v=1751547921&width=800',
  },
  {
    id: '2',
    name: 'Pants',
    price: 25,
    unit: 'piece',
    imageUrl: 'https://giorgiomwh.com/cdn/shop/products/Pants_IMG_0041.jpg?v=1614240623',
  },
  {
    id: '3',
    name: 'Saree',
    price: 40,
    unit: 'piece',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQpXostYYOMiyLhIFXXQ90-0BpCx_qg26fiQ&s',
  },
  {
    id: '4',
    name: 'Suit',
    price: 50,
    unit: 'piece',
    imageUrl: 'https://www.shutterstock.com/image-vector/blue-business-suit-tie-600nw-307168991.jpg',
  },
  {
    id: '5',
    name: 'Dress',
    price: 35,
    unit: 'piece',
    imageUrl: 'https://5.imimg.com/data5/VF/NF/MY-48288263/one-piece-dress-500x500.jpg',
  },
  {
    id: '6',
    name: 'Bedsheet',
    price: 40,
    unit: 'piece',
    imageUrl: 'https://www.fabmart.com/cdn/shop/products/hotel-quality-bed-sheets-bed-sheets-with-stripes-350-thread-count-maroon-1_1024x1024.jpg?v=1476774094',
  },
];
