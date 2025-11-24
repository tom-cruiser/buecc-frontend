import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Property, PropertyImage } from "../../types"; // Ensure this is updated to reflect your actual types
import { useProperties } from "../../context/PropertyContext";
import { X, Upload, Loader2, Home } from "lucide-react";

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  visible?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onClose,
  visible = true,
}) => {
  const { createProperty, updateProperty } = useProperties();
  type ImageItem = { id: string; url: string; file?: File; isExisting?: boolean; filename?: string };

  const initialFormState = useMemo<Partial<Property>>(
    () => ({
      title: "",
      description: "",
      propertyId: "",
      type: "house",
      status: "available",
      price: undefined,
      currency: "USD",
      location: {
        address: "",
        city: "",
        neighborhood: "",
        coordinates: { lat: 0, lng: 0 },
      },
      area: undefined,
      unit: "sqm",
      bedrooms: 0,
      bathrooms: 0,
      images: [],
      amenities: [],
      features: [],
      yearBuilt: undefined,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    []
  );

  const [formData, setFormData] = useState<Partial<Property>>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [externalUrl, setExternalUrl] = useState<string>("");

  type LocationPartial = Partial<Property["location"]> & {
    coordinates?: Partial<Property["location"]["coordinates"]>;
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setImages([]);
    setError(null);
  }, [initialFormState]);

  // Initialize form with property data
  useEffect(() => {
    if (property) {
      setFormData(property);
      setImages(
        (property.images || []).map((img: PropertyImage | string, index: number) => {
          const url = typeof img === "string" ? img : img?.url || "";
          const filename = typeof img === "string" ? undefined : img?.filename;
          return { id: `existing-${index}`, url, isExisting: true, filename };
        })
      );
    } else {
      resetForm();
    }
  }, [property, resetForm]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      // Handle nested location fields using dot notation: 'location.address' or 'location.coordinates.lat'
      if (name.startsWith("location.")) {
        const parts = name.split(".").slice(1);
        setFormData((prev) => {
          const location: LocationPartial = { ...(prev.location || {}) };
          if (parts.length === 1) {
            const key = parts[0];
            if (key === "address") location.address = value;
            if (key === "city") location.city = value;
            if (key === "neighborhood") location.neighborhood = value;
          } else if (parts.length === 2) {
            const [sub, key] = parts;
            if (sub === "coordinates") {
              location.coordinates = {
                lat: location.coordinates?.lat ?? 0,
                lng: location.coordinates?.lng ?? 0,
              };
              if (key === "lat") location.coordinates.lat = Number(value);
              if (key === "lng") location.coordinates.lng = Number(value);
            }
          }
          return { ...prev, location } as Partial<Property>;
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      }));
    },
    []
  );

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    if (!formData.title) errors.push("Title is required");
    if (!formData.description) errors.push("Description is required");
    if ((formData.price ?? 0) <= 0) errors.push("Valid price is required");
    if (!formData.location?.address) errors.push("Address is required");
    if (!formData.location?.city) errors.push("City is required");
    if ((formData.area ?? 0) <= 0) errors.push("Valid area is required");
    return errors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const validationErrors = validateForm();
        if (validationErrors.length > 0)
          throw new Error(validationErrors.join(", "));
        // Handle submission logic here...
        // Prepare files (newly uploaded) and payload (keep existing image URLs)
        const files = images.filter((i) => i.file).map((i) => i.file!) as File[];
        const payload = {
          ...(formData as Partial<Property>),
          images: images
            .filter((i) => i.isExisting)
            .map((i) => ({ url: i.url, filename: i.filename })) as PropertyImage[],
        } as unknown as Omit<Property, "_id">;

        let result: Property | null = null;
        if (property?._id) {
          result = await updateProperty(property._id, payload, files);
        } else {
          result = await createProperty(payload, files);
        }
        if (result) {
          resetForm();
          onClose();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to submit property"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      formData,
      property,
      validateForm,
      createProperty,
      updateProperty,
      resetForm,
      onClose,
      images,
    ]
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Home className="text-blue-600" size={28} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{property ? "Edit Property" : "Create Property"}</h2>
                <p className="text-sm text-gray-500">Add or update the property details and images</p>
                {error ? (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Basic information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Title</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Reference ID</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    name="propertyId"
                    value={(formData as Partial<Property>).propertyId || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Description</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 h-28 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Price & details */}
            <section className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Price & details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Price</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="number"
                    name="price"
                    value={formData.price ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Currency</label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    name="currency"
                    value={formData.currency || "USD"}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Area (sqm)</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="number"
                    name="area"
                    value={formData.area ?? ""}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit || "sqm"}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm text-gray-600">Bedrooms</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms || 0}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms || 0}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Year built</label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Address</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location?.address || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location?.city || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Neighborhood</label>
                  <input
                    type="text"
                    name="location.neighborhood"
                    value={formData.location?.neighborhood || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <input
                  type="number"
                  name="location.coordinates.lat"
                  value={formData.location?.coordinates?.lat || 0}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  name="location.coordinates.lng"
                  value={formData.location?.coordinates?.lng || 0}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </section>

            {/* Features & Amenities */}
            <section className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Features & Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Amenities</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add amenity and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value.trim();
                          if (!val) return;
                          setFormData((prev) => ({
                            ...prev,
                            amenities: [...(prev.amenities || []), val],
                          }));
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }}
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(formData.amenities || []).map((am, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs">
                        {am}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, amenities: (prev.amenities || []).filter((_, idx) => idx !== i) }))}
                          className="ml-2 text-blue-400 hover:text-blue-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Features</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add feature and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value.trim();
                          if (!val) return;
                          setFormData((prev) => ({
                            ...prev,
                            features: [...(prev.features || []), val],
                          }));
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }}
                      className="w-full rounded-md border border-gray-200 px-3 py-2"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(formData.features || []).map((ft, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-800 text-xs">
                        {ft}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, features: (prev.features || []).filter((_, idx) => idx !== i) }))}
                          className="ml-2 text-green-400 hover:text-green-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Images Section */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Images</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                <Upload className="mx-auto text-gray-400" size={36} />
                <p className="mt-3 text-sm text-gray-600">Drag & drop images here, or click to select. PNG/JPG/WebP up to 10MB.</p>
                <label className="mt-4 inline-block">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      const newImages = files.map((f) => ({ id: `new-${Date.now()}-${Math.random()}`, url: URL.createObjectURL(f), file: f, isExisting: false }));
                      setImages((prev) => [...prev, ...newImages]);
                      e.currentTarget.value = "";
                    }}
                  />
                  <div className="mt-2 text-sm text-blue-600 font-medium cursor-pointer">Upload images</div>
                </label>

                {/* External URL input */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="Paste external image URL and press Add"
                    className="flex-1 rounded-md border border-gray-200 px-3 py-2"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded-md"
                    onClick={() => {
                      const val = externalUrl.trim();
                      if (!val) return;
                      setImages((prev) => [
                        ...prev,
                        { id: `url-${Date.now()}`, url: val, isExisting: false },
                      ]);
                      setExternalUrl("");
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Image previews */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {images.map((img: ImageItem) => (
                    <div key={img.id} className="relative rounded overflow-hidden">
                      <img src={img.url} alt="preview" className="w-full h-32 object-cover" />
                      <button type="button" onClick={() => setImages((prev) => prev.filter((i) => i.id !== img.id))} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right: Actions & meta */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Publish</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <select name="status" value={formData.status || "available"} onChange={handleChange} className="mt-1 rounded-md border border-gray-200 px-2 py-2 w-full">
                    <option value="available">Available</option>
                    <option value="under-contract">Under Contract</option>
                    <option value="sold">Sold</option>
                    <option value="under-construction">Under Construction</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} />
                  <span className="text-sm text-gray-600">Featured</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
              <div className="flex flex-col gap-2">
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                  {loading ? <Loader2 className="animate-spin mr-2 inline" size={16} /> : null}
                  {property ? "Update Property" : "Create Property"}
                </button>
                <button type="button" onClick={resetForm} className="w-full border border-gray-200 py-2 rounded-md">Reset</button>
                <button type="button" onClick={onClose} className="w-full text-gray-600 py-2 rounded-md">Close</button>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
