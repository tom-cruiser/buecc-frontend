import React, { useState, useEffect } from "react";
import { Property, Inquiry } from "../types";
import {
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Heart,
  Loader2,
} from "lucide-react";
import InquiryForm from "./InquiryForm";

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
  isOpen: boolean;
  isLoading?: boolean;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  isOpen,
  isLoading = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<number[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle mount/unmount and visibility transitions
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset states when property changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setShowInquiryForm(false);
      setImageLoadError([]);
      setImageLoaded(false);
    }
  }, [isOpen, property]);

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => {
      const nextIndex = (prev + 1) % property.images.length;
      return imageLoadError.includes(nextIndex)
        ? (nextIndex + 1) % property.images.length
        : nextIndex;
    });
    setImageLoaded(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => {
      const prevIndex =
        (prev - 1 + property.images.length) % property.images.length;
      return imageLoadError.includes(prevIndex)
        ? (prevIndex - 1 + property.images.length) % property.images.length
        : prevIndex;
    });
    setImageLoaded(false);
  };

  // Helper functions
  const formatPrice = (price: number, currency: string) => {
    return `${currency === "USD" ? "$" : currency} ${price.toLocaleString()}`;
  };

  const handleImageError = (index: number) => {
    if (!imageLoadError.includes(index)) {
      setImageLoadError([...imageLoadError, index]);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInquirySuccess = (inquiry: Inquiry) => {
    console.log("Inquiry successful:", inquiry);
    setShowInquiryForm(false);
  };

  const handleInquiryCancel = () => {
    setShowInquiryForm(false);
  };

  // Get valid images (filter out failed loads)
  const getValidImages = () => {
    return property.images.filter(
      (_, index) => !imageLoadError.includes(index)
    );
  };

  const validImages = getValidImages();
  const currentImage = validImages[currentImageIndex] || property.images[0];
  const currentImageUrl =
    typeof currentImage === "string" ? currentImage : currentImage?.url;

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700">Loading property details...</p>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Left Side - Images */}
            <div className="flex-1 relative min-h-[400px] bg-gray-100">
              <div className="relative h-full">
                {property.images && property.images.length > 0 ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <img
                      src={currentImageUrl}
                      alt={property.title}
                      className={`w-full h-full object-cover ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      loading="eager"
                      onLoad={handleImageLoad}
                      onError={() => handleImageError(currentImageIndex)}
                    />

                    {/* Fallback for failed images */}
                    {imageLoadError.includes(currentImageIndex) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center p-4">
                          <p className="text-gray-500 mb-2">
                            Image not available
                          </p>
                          {validImages.length > 0 ? (
                            <button
                              onClick={() => setCurrentImageIndex(0)}
                              className="text-blue-600 underline"
                            >
                              Show first available image
                            </button>
                          ) : (
                            <p className="text-gray-500">No images available</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {validImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {validImages.length}
                        </div>
                      </>
                    )}

                    {/* Image Thumbnails */}
                    {validImages.length > 1 && (
                      <div className="absolute bottom-4 left-4 flex space-x-2">
                        {validImages.slice(0, 4).map((image, index) => {
                          const imageUrl =
                            typeof image === "string" ? image : image.url;
                          return (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                currentImageIndex === index
                                  ? "border-white scale-105"
                                  : "border-white/50"
                              }`}
                              aria-label={`View image ${index + 1}`}
                            >
                              <img
                                src={imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder-property.jpg";
                                }}
                              />
                            </button>
                          );
                        })}
                        {validImages.length > 4 && (
                          <div className="w-16 h-12 rounded-lg bg-black/50 flex items-center justify-center text-white text-xs">
                            +{validImages.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
                    No images available
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Property Details */}
            <div className="w-96 flex flex-col border-l border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(property.price, property.currency)}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h2>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>{property.location.address}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Add to favorites"
                    >
                      <Heart size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Close modal"
                    >
                      <X size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Details Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {property.bedrooms !== undefined && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="mx-auto mb-2 text-gray-600" size={20} />
                      <div className="font-medium">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bath className="mx-auto mb-2 text-gray-600" size={20} />
                      <div className="font-medium">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  )}
                  {property.area && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Square
                        className="mx-auto mb-2 text-gray-600"
                        size={20}
                      />
                      <div className="font-medium">{property.area}m²</div>
                      <div className="text-sm text-gray-600">Area</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Property Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Property Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-medium">{property.propertyId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {property.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">
                        {property.status.replace("-", " ")}
                      </span>
                    </div>
                    {property.yearBuilt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year Built:</span>
                        <span className="font-medium">
                          {property.yearBuilt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <Star size={14} className="mr-2 text-yellow-500" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Features</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {property.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <Tag size={14} className="mr-2 text-blue-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center"
                    aria-label="Inquire about this property"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Inquire
                  </button>
                  <button
                    className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
                    aria-label="Call about this property"
                  >
                    <Phone size={16} className="mr-2" />
                    Call
                  </button>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                  Schedule Viewing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="absolute inset-0 bg-white p-6 overflow-y-auto">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Send Inquiry</h3>
                <button
                  onClick={() => setShowInquiryForm(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close inquiry form"
                >
                  <X size={20} />
                </button>
              </div>
              <InquiryForm
                property={property}
                onSuccess={handleInquirySuccess}
                onCancel={handleInquiryCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyModal;
