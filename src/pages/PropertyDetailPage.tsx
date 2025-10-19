import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import PropertyModal from "../components/PropertyModal";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

interface PropertyImage {
  url?: string;
  filename?: string;
  path?: string;
  fileId?: string;
  publicId?: string;
  originalName?: string;
  size?: number;
  mimetype?: string;
  uploadedAt?: string;
}

interface Property {
  id: string;
  _id?: string;
  propertyId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  status:
    | "available"
    | "under-contract"
    | "sold"
    | "under-construction"
    | string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  yearBuilt?: number;
  featured?: boolean;
  images: Array<string | PropertyImage>;
  amenities: string[];
  features: string[];
  location: {
    address: string;
    city: string;
    state?: string;
    country?: string;
    zipCode?: string;
    neighborhood?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processImageUrls = (images: Property["images"]): string[] => {
    console.log("Processing images:", images);

    if (!images || !Array.isArray(images)) {
      console.log("No images found, returning placeholder");
      return ["/placeholder-property.jpg"];
    }

    const processedUrls = images.map((img, index) => {
      console.log(`Processing image ${index}:`, img);

      let imageUrl = "";

      // Case 1: Image is already a URL string
      if (typeof img === "string") {
        imageUrl = img;
      } else if (img && typeof img === "object") {
        // Case 2: Image is an object - prioritize URL field
        imageUrl = img.url || img.filename || "";
      }

      // If no URL found, return placeholder
      if (!imageUrl) {
        console.log(`No URL found for image ${index}, using placeholder`);
        return "/placeholder-property.jpg";
      }

      // If it's already a complete URL (http/https), return as-is
      if (/^https?:\/\//i.test(imageUrl)) {
        console.log(`Complete URL found: ${imageUrl}`);
        return imageUrl;
      }

      // If it starts with /uploads, it's already a relative path from your backend
      if (imageUrl.startsWith("/uploads")) {
        const fullUrl = `http://localhost:5000${imageUrl}`;
        console.log(`Uploads path found, converted to: ${fullUrl}`);
        return fullUrl;
      }

      // If it's just a filename, assume it's in the uploads directory
      if (imageUrl && !imageUrl.includes("/")) {
        const fullUrl = `http://localhost:5000/uploads/${imageUrl}`;
        console.log(`Filename found, converted to: ${fullUrl}`);
        return fullUrl;
      }

      // If it's any other path, try to construct the full URL
      const fullUrl = `http://localhost:5000${
        imageUrl.startsWith("/") ? "" : "/"
      }${imageUrl}`;
      console.log(`Other path found, converted to: ${fullUrl}`);
      return fullUrl;
    });

    console.log("Final processed URLs:", processedUrls);
    return processedUrls;
  };

  const fetchProperty = async (propertyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch property: ${response.statusText}`
        );
      }

      const { data } = await response.json();
      console.log("Raw property data:", data);

      // Process images to ensure consistent format
      const processedData = {
        ...data,
        id: data._id || data.id,
        images: processImageUrls(data.images || []),
      };

      console.log("Processed property data:", processedData);
      setProperty(processedData);
    } catch (err: any) {
      console.error("Error loading property:", err);
      setError(err.message || "Failed to load property");
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No property ID provided");
      setIsLoading(false);
      return;
    }

    fetchProperty(id);
  }, [id, getToken]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">
            🏠 Property Not Found
          </div>
          <p className="text-gray-600 mb-4">
            The requested property could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PropertyModal
        property={property}
        onClose={() => navigate(-1)}
        isOpen={true}
        isLoading={false}
      />
    </div>
  );
};

export default PropertyDetailPage;
