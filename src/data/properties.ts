import { Property } from '../types';

export const properties: Property[] = [
  {
    id: '1',
    title: 'Modern Villa in Rohero',
    description: 'Stunning modern villa with panoramic views of Lake Tanganyika. Features contemporary architecture, spacious rooms, and premium finishes throughout.',
    price: 850000,
    currency: 'USD',
    type: 'villa',
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    location: {
      address: '123 Lake View Drive, Rohero',
      neighborhood: 'Rohero',
      city: 'Bujumbura',
      coordinates: { lat: -3.3731, lng: 29.3644 }
    },
    images: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Swimming Pool', 'Garden', 'Garage', 'Security System', 'Lake View'],
    features: ['Modern Kitchen', 'Master Suite', 'Walk-in Closets', 'Terrace'],
    yearBuilt: 2022,
    propertyId: 'BU-VIL-001',
    featured: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Executive Apartment in Centre Ville',
    description: 'Luxurious apartment in the heart of Bujumbura\'s business district. Perfect for executives and professionals seeking comfort and convenience.',
    price: 450000,
    currency: 'USD',
    type: 'apartment',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    location: {
      address: '456 Independence Avenue',
      neighborhood: 'Centre Ville',
      city: 'Bujumbura',
      coordinates: { lat: -3.3614, lng: 29.3599 }
    },
    images: [
      'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Balcony', 'Air Conditioning', 'Parking', 'Elevator', 'City View'],
    features: ['Open Plan Living', 'Modern Appliances', 'Built-in Wardrobes'],
    yearBuilt: 2021,
    propertyId: 'BU-APT-002',
    featured: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Commercial Plot in Kiriri',
    description: 'Prime commercial land in rapidly developing Kiriri area. Ideal for retail, office, or mixed-use development. Strategic location with high visibility.',
    price: 280000,
    currency: 'USD',
    type: 'land',
    status: 'available',
    area: 1200,
    location: {
      address: 'Kiriri Commercial Zone',
      neighborhood: 'Kiriri',
      city: 'Bujumbura',
      coordinates: { lat: -3.3456, lng: 29.3812 }
    },
    images: [
      'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Main Road Access', 'Utilities Available', 'Commercial Zoning'],
    features: ['Corner Plot', 'Development Ready', 'High Traffic Area'],
    propertyId: 'BU-LND-003',
    featured: false,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  },
  {
    id: '4',
    title: 'Family House in Ngagara',
    description: 'Comfortable family home in peaceful Ngagara neighborhood. Well-maintained property with spacious rooms and a lovely garden.',
    price: 320000,
    currency: 'USD',
    type: 'house',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 220,
    location: {
      address: '789 Family Street, Ngagara',
      neighborhood: 'Ngagara',
      city: 'Bujumbura',
      coordinates: { lat: -3.3512, lng: 29.3456 }
    },
    images: [
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Garden', 'Parking', 'Security Gate', 'Water Tank'],
    features: ['Spacious Living Room', 'Dining Room', 'Kitchen', 'Porch'],
    yearBuilt: 2018,
    propertyId: 'BU-HOU-004',
    featured: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  },
  {
    id: '5',
    title: 'Luxury Penthouse in Mutanga',
    description: 'Exclusive penthouse offering breathtaking views and premium amenities. The epitome of luxury living in Bujumbura.',
    price: 950000,
    currency: 'USD',
    type: 'apartment',
    status: 'under-construction',
    bedrooms: 4,
    bathrooms: 4,
    area: 280,
    location: {
      address: 'Mutanga Heights Tower',
      neighborhood: 'Mutanga',
      city: 'Bujumbura',
      coordinates: { lat: -3.3589, lng: 29.3723 }
    },
    images: [
      'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Rooftop Terrace', 'Gym', 'Concierge', 'Underground Parking', 'Panoramic Views'],
    features: ['Smart Home System', 'Premium Finishes', 'Floor-to-ceiling Windows'],
    yearBuilt: 2024,
    propertyId: 'BU-PEN-005',
    featured: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12'
  },
  {
    id: '6',
    title: 'Office Building in Buyenzi',
    description: 'Modern commercial building perfect for corporate headquarters or multi-tenant office space. Strategic location with excellent access.',
    price: 1200000,
    currency: 'USD',
    type: 'commercial',
    status: 'available',
    area: 850,
    location: {
      address: '321 Business Plaza, Buyenzi',
      neighborhood: 'Buyenzi',
      city: 'Bujumbura',
      coordinates: { lat: -3.3667, lng: 29.3578 }
    },
    images: [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Elevator', 'Conference Rooms', 'Parking Lot', 'Security System', 'Reception Area'],
    features: ['Multiple Floors', 'Open Floor Plans', 'Modern HVAC', 'Fiber Internet Ready'],
    yearBuilt: 2020,
    propertyId: 'BU-COM-006',
    featured: false,
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07'
  }
];