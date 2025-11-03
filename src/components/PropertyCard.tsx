import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Property } from "../types";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Heart,
  MessageCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import InquiryForm from "./InquiryForm";
import config from '../config/config';

interface PropertyCardProps {
  property: Property;
  viewMode?: "grid" | "list";
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  viewMode = "grid",
}) => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Helper functions
  const formatPrice = (price: number, currency: string) => {
    return `${currency === "USD" ? "$" : currency} ${price.toLocaleString()}`;
  };

  const getStatusColor = (status: Property["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "under-contract":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "under-construction":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Property["status"]) => {
    switch (status) {
      case "available":
        return "Available";
      case "under-contract":
        return "Under Contract";
      case "sold":
        return "Sold";
      case "under-construction":
        return "Under Construction";
      default:
        return status;
    }
  };

  // Enhanced image URL handling with debugging
  const getMainImageUrl = () => {
    if (!property.images || property.images.length === 0) {
      console.debug(
        "No images array or empty images array for property:",
        property.id
      );
      return null;
    }

    const firstImage = property.images[0];
    let url = typeof firstImage === "string" ? firstImage : firstImage.url;

    console.debug("Raw image URL:", url, "from property:", property.id);

    if (!url) {
      console.warn("No URL found in image data:", firstImage);
      return null;
    }

    // Handle different URL formats
    if (url.startsWith("http")) {
      console.debug("Using absolute URL directly");
      return url;
    }

    // Use centralized config to generate absolute image URLs. This ensures
    // images are requested from the backend/ImageKit rather than the
    // frontend origin (which produced 404s).
    try {
      const imageUrl = config.getImageUrl(url);
      console.debug("Resolved image URL via config:", imageUrl);
      return imageUrl;
    } catch (e) {
      console.warn("Failed to resolve image URL via config, falling back to raw path", e);
      // Fallback: return the raw URL so browser can attempt to load it
      return url.startsWith("/") ? url : `/uploads/${url}`;
    }
  };

  const mainImageUrl = getMainImageUrl();
  console.log("Final image URL for property", property.id, ":", mainImageUrl);

  const handleInquirySuccess = () => {
    setShowInquiryForm(false);
  };

  const handleInquiryCancel = () => {
    setShowInquiryForm(false);
  };

  if (showInquiryForm) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 relative">
        <button
          onClick={handleInquiryCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close inquiry form"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Inquire About {property.title}
        </h3>
        <InquiryForm
          property={property}
          onSuccess={handleInquirySuccess}
          onCancel={handleInquiryCancel}
        />
      </div>
    );
  }

  // Image display component
  const PropertyImage = () => {
    if (!mainImageUrl) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <ImageIcon className="text-gray-400" size={32} />
          <span className="sr-only">No image available</span>
        </div>
      );
    }

    return (
      <img
        src={mainImageUrl}
        alt={`${property.title} property`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          console.error("Image load failed:", mainImageUrl);
          e.currentTarget.src = "/placeholder-property.jpg";
          e.currentTarget.className = "w-full h-full object-cover bg-gray-100";
        }}
        loading="lazy"
      />
    );
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-64 h-48 flex-shrink-0">
            <PropertyImage />

            {/* Status Badge */}
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                property.status
              )}`}
            >
              {getStatusText(property.status)}
            </div>

            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price, property.currency)}
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                ID: {property.propertyId}
              </div>
            </div>

            <Link to={`/property/${property.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200">
                {property.title}
              </h3>
            </Link>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span className="text-sm">
                {property.location.neighborhood}, {property.location.city}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600 mb-4">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed size={16} className="mr-1 text-gray-400" />
                  <span className="text-sm">{property.bedrooms} bed</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath size={16} className="mr-1 text-gray-400" />
                  <span className="text-sm">{property.bathrooms} bath</span>
                </div>
              )}
              <div className="flex items-center">
                <Square size={16} className="mr-1 text-gray-400" />
                <span className="text-sm">{property.area}m²</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {property.description}
            </p>

            <div className="flex space-x-3">
              <Link
                to={`/property/${property.id}`}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center flex items-center justify-center"
              >
                <Eye size={16} className="mr-2" /> View Details
              </Link>
              <button
                onClick={() => setShowInquiryForm(true)}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
              >
                <MessageCircle size={16} className="mr-1" />
                Inquire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image Container */}
      <div className="relative overflow-hidden h-64">
        <PropertyImage />

        {/* Status Badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            property.status
          )}`}
        >
          {getStatusText(property.status)}
        </div>

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200"
            aria-label="Add to favorites"
          >
            <Heart size={16} className="text-gray-700" />
          </button>
          <Link
            to={`/property/${property.id}`}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200 flex items-center justify-center"
            aria-label="View property details"
          >
            <Eye size={16} className="text-gray-700" />
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(property.price, property.currency)}
          </div>
          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ID: {property.propertyId}
          </div>
        </div>

        <Link to={`/property/${property.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin size={16} className="mr-2 text-gray-400" />
          <span className="text-sm">
            {property.location.neighborhood}, {property.location.city}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-600 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed size={16} className="mr-1 text-gray-400" />
              <span className="text-sm">{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath size={16} className="mr-1 text-gray-400" />
              <span className="text-sm">{property.bathrooms} bath</span>
            </div>
          )}
          <div className="flex items-center">
            <Square size={16} className="mr-1 text-gray-400" />
            <span className="text-sm">{property.area}m²</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex space-x-3">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center flex items-center justify-center"
          >
            <Eye size={16} className="mr-2" /> View Details
          </Link>
          <button
            onClick={() => setShowInquiryForm(true)}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <MessageCircle size={16} className="mr-1" />
            Inquire
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
