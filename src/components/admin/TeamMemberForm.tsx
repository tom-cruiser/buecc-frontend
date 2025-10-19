// src/components/TeamMemberForm.tsx

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import { TeamMember } from "../types"; // Adjust path as needed
import { X, Upload, Loader2 } from "lucide-react"; // Import relevant Lucide icons

// Define props for the TeamMemberForm component
interface TeamMemberFormProps {
  initialData?: TeamMember | null; // Optional prop for editing existing team members
  onClose: () => void; // Function to call when the form is closed/cancelled
  onSubmit: (
    teamMember: Omit<TeamMember, "id"> & { id?: string },
    imageFile?: File | null
  ) => void;
  // Omit 'id' for new members, but allow it for updates.
  // Pass imageFile separately for actual upload to backend.
  isLoading?: boolean; // Optional prop to show loading state on submit button
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  initialData,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null); // To hold the actual file for upload
  const [specialties, setSpecialties] = useState<string[]>(
    initialData?.specialties || []
  );
  const [newSpecialty, setNewSpecialty] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to update form fields if initialData changes (e.g., when editing a different member)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setBio(initialData.bio);
      setImagePreview(initialData.image);
      setImageFile(null); // Clear file if switching to another existing member
      setSpecialties(initialData.specialties);
    } else {
      // Clear form for new member creation
      setName("");
      setRole("");
      setBio("");
      setImagePreview(null);
      setImageFile(null);
      setSpecialties([]);
    }
    setNewSpecialty(""); // Always clear new specialty input
  }, [initialData]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

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
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input field
    }
  };

  const handleAddSpecialty = () => {
    const trimmedSpecialty = newSpecialty.trim();
    if (trimmedSpecialty && !specialties.includes(trimmedSpecialty)) {
      setSpecialties([...specialties, trimmedSpecialty]);
      setNewSpecialty(""); // Clear input after adding
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    setSpecialties(specialties.filter((s) => s !== specialtyToRemove));
  };

  const handleSpecialtyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleAddSpecialty();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const teamMemberData: Omit<TeamMember, "id"> & { id?: string } = {
      name,
      role,
      bio,
      image: imagePreview || "", // Use imagePreview as the path/URL for the image field
      specialties,
    };

    if (initialData?.id) {
      teamMemberData.id = initialData.id; // Include ID if it's an update
    }

    onSubmit(teamMemberData, imageFile); // Pass the team member data and the actual file
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Team Member" : "Add New Team Member"}
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
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Biography <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {imagePreview && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image"
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

          {/* Specialties (Tags) */}
          <div>
            <label
              htmlFor="newSpecialty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Specialties
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialty(specialty)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove ${specialty}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                id="newSpecialty"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={handleSpecialtyKeyDown}
                placeholder="Add a specialty and press Enter"
                className="flex-grow border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSpecialty}
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
                "Add Team Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberForm;
