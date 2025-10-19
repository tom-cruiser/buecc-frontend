// src/components/ConstructionProjectForm.tsx

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { ConstructionProject } from "../types"; // Adjust path as needed
import { X, Upload, Loader2, Calendar } from "lucide-react"; // Import relevant Lucide icons

// Define props for the ConstructionProjectForm component
interface ConstructionProjectFormProps {
  initialData?: ConstructionProject | null; // Optional prop for editing existing projects
  onClose: () => void; // Function to call when the form is closed/cancelled
  onSubmit: (
    project: Omit<ConstructionProject, "id" | "image"> & {
      id?: string;
      image: string;
    }, // Changed 'images' to 'image'
    imageFile?: File | null // Changed 'imageFiles' to 'imageFile'
  ) => void;
  isLoading?: boolean; // Optional prop to show loading state on submit button
}

const CATEGORIES = ["residential", "commercial", "industrial", "renovation"];

const ConstructionProjectForm: React.FC<ConstructionProjectFormProps> = ({
  initialData,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState<ConstructionProject["category"]>(
    initialData?.category || "residential"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  ); // Changed to single string
  const [imageFile, setImageFile] = useState<File | null>(null); // Changed to single File
  const [completionDate, setCompletionDate] = useState(
    initialData?.completionDate || ""
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [clientTestimonial, setClientTestimonial] = useState(
    initialData?.clientTestimonial || ""
  );
  const [services, setServices] = useState<string[]>(
    initialData?.services || []
  );
  const [newService, setNewService] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to update form fields if initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setImagePreview(initialData.image); // Set single image
      setImageFile(null); // Clear file input when loading existing data
      setCompletionDate(initialData.completionDate);
      setLocation(initialData.location);
      setClientTestimonial(initialData.clientTestimonial || "");
      setServices(initialData.services);
    } else {
      // Clear form for new project creation
      setTitle("");
      setDescription("");
      setCategory("residential");
      setImagePreview(null); // Clear single image
      setImageFile(null);
      setCompletionDate("");
      setLocation("");
      setClientTestimonial("");
      setServices([]);
    }
    setNewService(""); // Always clear new service input
  }, [initialData]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Store the single file

      // Create a URL for image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input so same file can be re-selected
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input field
    }
    // Clean up object URL if one was created for preview
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleAddService = () => {
    const trimmedService = newService.trim();
    if (trimmedService && !services.includes(trimmedService)) {
      setServices([...services, trimmedService]);
      setNewService("");
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  const handleServiceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddService();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const projectData: Omit<ConstructionProject, "id" | "image"> & {
      id?: string;
      image: string;
    } = {
      title,
      description,
      category,
      image: imagePreview || "", // Use the single image preview URL
      completionDate,
      location,
      clientTestimonial: clientTestimonial || undefined, // Set to undefined if empty
      services,
    };

    if (initialData?.id) {
      projectData.id = initialData.id; // Include ID if it's an update
    }

    onSubmit(projectData, imageFile); // Pass project data and the single new image file
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Project" : "Add New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ConstructionProject["category"])
              }
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Single Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreview && (
                <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden" // Hide the default file input
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload size={18} className="mr-2" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </button>
            </div>
            {!imagePreview && (
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB.
              </p>
            )}
          </div>

          {/* Completion Date */}
          <div>
            <label
              htmlFor="completionDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Completion Date <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type="date"
                id="completionDate"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Client Testimonial */}
          <div>
            <label
              htmlFor="clientTestimonial"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Client Testimonial (Optional)
            </label>
            <textarea
              id="clientTestimonial"
              value={clientTestimonial}
              onChange={(e) => setClientTestimonial(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Services (Tags) */}
          <div>
            <label
              htmlFor="newService"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Services Provided
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {services.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove ${service}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                id="newService"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={handleServiceKeyDown}
                placeholder="Add a service and press Enter"
                className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> Saving...
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Add Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConstructionProjectForm;
