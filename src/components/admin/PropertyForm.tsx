import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Property } from "../../types";
import { useProperties } from "../../context/PropertyContext";
import {
  X,
  Upload,
  Loader2,
  MapPin,
  Home,
  DollarSign,
  Calendar,
} from "lucide-react";

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  visible?: boolean;
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
  filename?: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onClose,
  visible = true,
}) => {
  // Initial form state
  const {
    createProperty,
    updateProperty,
    deletePropertyImage,
    loading: contextLoading,
  } = useProperties();
  const initialFormState: Partial<Property> = {
    title: "",
    description: "",
    type: "house",
    status: "available",
    price: 0,
    currency: "USD",
    location: {
      address: "",
      city: "",
      neighborhood: "",
      coordinates: { lat: 0, lng: 0 },
    },
    area: 0,
    unit: "sqm",
    bedrooms: 0,
    bathrooms: 0,
    images: [],
    amenities: [],
    features: [],
    yearBuilt: undefined,
    featured: false,
    createdAt: "",
    updatedAt: "",
  };

  // State management
  const [formData, setFormData] = useState<Partial<Property>>(initialFormState);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removedImageFilenames, setRemovedImageFilenames] = useState<string[]>(
    []
  );

  // Form options
  const propertyTypes = useMemo(
    () => [
      { value: "house", label: "House" },
      { value: "apartment", label: "Apartment" },
      { value: "condo", label: "Condo" },
      { value: "townhouse", label: "Townhouse" },
      { value: "villa", label: "Villa" },
      { value: "land", label: "Land" },
      { value: "commercial", label: "Commercial" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "available", label: "Available" },
      { value: "sold", label: "Sold" },
      { value: "rented", label: "Rented" },
      { value: "pending", label: "Pending" },
    ],
    []
  );

  const currencyOptions = useMemo(
    () => [
      { value: "USD", label: "USD ($)" },
      { value: "EUR", label: "EUR (€)" },
      { value: "GBP", label: "GBP (£)" },
      { value: "BIF", label: "BIF (Burundi Franc)" },
      { value: "CAD", label: "CAD" },
      { value: "AUD", label: "AUD" },
    ],
    []
  );

  const unitOptions = useMemo(
    () => [
      { value: "sqm", label: "Square Meters" },
      { value: "sqft", label: "Square Feet" },
    ],
    []
  );

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isExisting && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  // Initialize form with property data
  useEffect(() => {
    if (property) {
      setFormData(property);
      // Defensive: handle both string[] and PropertyImage[]
      const isPropertyImage = (
        img: unknown
      ): img is { url: string; filename?: string } => {
        return typeof img === "object" && img !== null && "url" in img;
      };
      const existingImages: ImageItem[] = (property.images || []).map(
        (imgData, index) => {
          if (typeof imgData === "string") {
            // Legacy: just a URL string
            return {
              id: `existing-${index}`,
              url: imgData,
              isExisting: true,
              filename: "",
            };
          } else if (isPropertyImage(imgData)) {
            // New: PropertyImage object
            return {
              id: `existing-${index}`,
              url: imgData.url,
              isExisting: true,
              filename: imgData.filename,
            };
          } else {
            // Fallback: skip or handle as needed
            return {
              id: `existing-${index}`,
              url: "",
              isExisting: true,
              filename: "",
            };
          }
        }
      );
      setImages(existingImages);
    } else {
      resetForm();
    }
  }, [property]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setImages([]);
    setError(null);
  }, [initialFormState]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      if (name.startsWith("location.")) {
        const field = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          location: {
            address:
              field === "address"
                ? type === "number"
                  ? String(parseFloat(value) || 0)
                  : value || ""
                : prev.location?.address || "",
            city:
              field === "city"
                ? type === "number"
                  ? String(parseFloat(value) || 0)
                  : value || ""
                : prev.location?.city || "",
            neighborhood:
              field === "neighborhood"
                ? type === "number"
                  ? String(parseFloat(value) || 0)
                  : value || ""
                : prev.location?.neighborhood || "",
            coordinates: prev.location?.coordinates || { lat: 0, lng: 0 },
          },
        }));
      } else if (name.startsWith("coordinates.")) {
        const field = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          location: {
            address: prev.location?.address || "",
            city: prev.location?.city || "",
            neighborhood: prev.location?.neighborhood || "",
            coordinates: {
              lat:
                field === "lat"
                  ? parseFloat(value) || 0
                  : prev.location?.coordinates?.lat ?? 0,
              lng:
                field === "lng"
                  ? parseFloat(value) || 0
                  : prev.location?.coordinates?.lng ?? 0,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]:
            type === "checkbox"
              ? checked
              : type === "number"
              ? parseFloat(value) || 0
              : value,
        }));
      }
    },
    []
  );

  const handleArrayChange = useCallback(
    (field: "amenities" | "features", value: string) => {
      if (!value.trim()) return;
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }));
    },
    []
  );

  const removeArrayItem = useCallback(
    (field: "amenities" | "features", index: number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== index) || [],
      }));
    },
    []
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const files = Array.from(e.target.files);

      // Validate file types and sizes
      const validFiles = files.filter((file) => {
        const isValidType = file.type.startsWith("image/");
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

        if (!isValidType) {
          setError(`Invalid file type: ${file.name}. Only images are allowed.`);
          return false;
        }
        if (!isValidSize) {
          setError(`File too large: ${file.name}. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      const newImages: ImageItem[] = validFiles.map((file) => ({
        id: `new-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
        isExisting: false,
      }));

      setImages((prev) => [...prev, ...newImages]);
      setError(null); // Clear any previous errors
      e.target.value = "";
    },
    []
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (
        imageToRemove &&
        !imageToRemove.isExisting &&
        imageToRemove.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      // If it's an existing image, track its filename for backend deletion
      if (imageToRemove && imageToRemove.isExisting && imageToRemove.filename) {
        setRemovedImageFilenames((prevFilenames) => [
          ...prevFilenames,
          imageToRemove.filename!,
        ]);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    if (!formData.title?.trim()) errors.push("Title is required");
    if (!formData.description?.trim()) errors.push("Description is required");
    if (!formData.price || formData.price <= 0)
      errors.push("Valid price is required");
    if (!formData.location?.address?.trim()) errors.push("Address is required");
    if (!formData.location?.city?.trim()) errors.push("City is required");
    if (!formData.area || formData.area <= 0)
      errors.push("Valid area is required");
    return errors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        // Validate form data
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(", "));
        }
        // --- Delete removed images from backend (if editing) ---
        if (property?._id && removedImageFilenames.length > 0) {
          for (const filename of removedImageFilenames) {
            // Call backend delete endpoint for each removed image
            // (Relies on PropertyContext's deletePropertyImage method)
            await deletePropertyImage(property._id, filename);
          }
        }
        // Prepare files for upload (only new images)
        const filesToUpload = images
          .filter((img) => img.file && !img.isExisting)
          .map((img) => img.file!);
        // Prepare property data (excluding images)
        const propertyDataForSubmission: Partial<Property> = { ...formData };
        delete propertyDataForSubmission.images;
        let result: Property | null = null;
        if (property?._id) {
          // Update existing property
          result = await updateProperty(
            property._id,
            propertyDataForSubmission,
            filesToUpload
          );
        } else {
          // Create new property
          result = await createProperty(
            propertyDataForSubmission as Omit<Property, "_id">,
            filesToUpload
          );
        }
        if (result) {
          resetForm();
          onClose();
        } else {
          throw new Error("Property operation failed - no result returned");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit property";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      images,
      property,
      validateForm,
      createProperty,
      updateProperty,
      resetForm,
      onClose,
      removedImageFilenames,
    ]
  );

  if (!visible) return null;

  const isLoading = loading || contextLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Home size={24} />
              {property ? "Edit Property" : "Add New Property"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the property..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type || "house"}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || "available"}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency || "USD"}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <MapPin size={20} />
                Location Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location?.address || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location?.city || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    name="location.neighborhood"
                    value={formData.location?.neighborhood || ""}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Neighborhood"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="coordinates.lat"
                      value={formData.location?.coordinates?.lat || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                      step="any"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="coordinates.lng"
                      value={formData.location?.coordinates?.lng || ""}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                      step="any"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit || "sqm"}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {unitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Year Built
                </label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt || ""}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2020"
                  min="1800"
                  max={new Date().getFullYear()}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Featured Property
                </label>
              </div>
            </div>

            {/* Amenities and Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleArrayChange("amenities", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    placeholder="Add amenity and press Enter"
                    disabled={isLoading}
                  />
                </div>
                {formData.amenities?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("amenities", index)}
                          className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600"
                          disabled={isLoading}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleArrayChange("features", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                    placeholder="Add feature and press Enter"
                    disabled={isLoading}
                  />
                </div>
                {formData.features?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("features", index)}
                          className="ml-1.5 inline-flex text-green-400 hover:text-green-600"
                          disabled={isLoading}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images ({images.length} selected)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload images
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG up to 10MB each. Multiple files supported.
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt="Property preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          // Confirmation dialog for existing images
                          if (img.isExisting) {
                            if (
                              !window.confirm(
                                "Are you sure you want to remove this image?"
                              )
                            )
                              return;
                          }
                          handleRemoveImage(img.id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </button>
                      {img.isExisting && img.filename && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="animate-spin mr-2" size={18} />
                )}
                {property ? "Update Property" : "Create Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
