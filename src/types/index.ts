export interface PropertyImage {
  url: string;
  filename: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
  path?: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: "house" | "apartment" | "villa" | "land" | "commercial";
  status: "available" | "under-contract" | "sold" | "under-construction";
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  unit: "sqm" | "sqft";
  location: {
    address: string;
    neighborhood: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: PropertyImage[];
  amenities: string[];
  features: string[];
  yearBuilt?: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  type?: Property["type"];
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  amenities?: string[];
  status?: Property["status"];
  keywords?: string;
}

export interface ConstructionProject {
  id: string;
  title: string;
  description: string;
  category: "residential" | "commercial" | "industrial" | "renovation";
  images: string[];
  completionDate: string;
  location: string;
  clientTestimonial?: string;
  services: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
}

export interface Inquiry {
  id: string;
  propertyId?: string;
  type: "property" | "construction" | "general";
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  createdAt: string;
}
