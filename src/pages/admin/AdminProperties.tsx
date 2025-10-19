import React, { useState, useEffect } from "react";
import { useProperties } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { Property } from "../../types";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import PropertyForm from "../../components/admin/ConstructionProjectForm";
import { useNavigate } from "react-router-dom";

const AdminProperties: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    deleteProperty,
    fetchProperties,
    createProperty,
    updateProperty,
  } = useProperties();

  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Improved image URL handling
  const getImageUrl = (property: Property): string => {
    if (!property?.images || property.images.length === 0) {
      return "/placeholder-property.jpg";
    }

    // Handle both string and object image formats
    const firstImage = property.images[0];
    let url =
      typeof firstImage === "string" ? firstImage : firstImage?.url || "";

    // Convert relative paths to absolute URLs in production
    if (process.env.NODE_ENV === "production" && url.startsWith("/uploads/")) {
      return `${window.location.origin}${url}`;
    }

    // Handle development environment with local server
    if (process.env.NODE_ENV === "development" && url.startsWith("/uploads/")) {
      return `http://localhost:5000${url}`; // Adjust port if different
    }

    return url || "/placeholder-property.jpg";
  };

  // Enhanced safeGet with proper typing
  const safeGet = <T,>(obj: any, path: string, defaultValue: T): T => {
    const result = path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
    return result !== undefined ? result : defaultValue;
  };

  const filteredProperties = properties.filter((property) => {
    if (!property) return false;

    const title = safeGet<string>(property, "title", "");
    const neighborhood = safeGet<string>(property, "location.neighborhood", "");
    const propertyId = safeGet<string>(property, "propertyId", "");
    const status = safeGet<string>(property, "status", "");

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) navigate("/admin/login");
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setActionError(null);
      try {
        const success = await deleteProperty(id);
        if (!success) {
          setActionError("Failed to delete property. Please try again.");
        }
      } catch (error) {
        setActionError("An error occurred while deleting the property.");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const handleFormSubmit = async (propertyData: Partial<Property>) => {
    setActionError(null);
    try {
      if (editingProperty && editingProperty._id) {
        const result = await updateProperty(editingProperty._id, propertyData);
        if (!result) throw new Error("Failed to update property");
      } else {
        const result = await createProperty(propertyData);
        if (!result) throw new Error("Failed to create property");
      }
      handleCloseForm();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  const getStatusColor = (status: string = "") => {
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

  const formatStatus = (status: string = "") => {
    return status.replace(/-/g, " ") || "Unknown";
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={64} />
        <p className="ml-4 text-xl text-gray-700">
          Checking authentication status...
        </p>
      </div>
    );
  }

  if (propertiesError) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p className="mb-4">{propertiesError}</p>
        <button
          onClick={fetchProperties}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (propertiesLoading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-4 text-lg text-gray-700">Loading properties data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Property
        </button>
      </div>

      {actionError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Action Failed!</strong>
          <span className="block sm:inline ml-2">{actionError}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setActionError(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title, neighborhood, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="under-contract">Under Contract</option>
            <option value="sold">Sold</option>
            <option value="under-construction">Under Construction</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Property
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Location
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Price
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Type
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {propertiesLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={32}
                    />
                    <p className="mt-2 text-gray-600">Loading properties...</p>
                  </td>
                </tr>
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((property) => {
                  const imageUrl = getImageUrl(property);
                  return (
                    <tr key={property._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={safeGet<string>(
                                  property,
                                  "title",
                                  "Property"
                                )}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-property.jpg";
                                  e.currentTarget.className =
                                    "w-full h-full object-cover bg-gray-100";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon
                                  className="text-gray-400"
                                  size={20}
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {safeGet<string>(
                                property,
                                "title",
                                "Untitled Property"
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID:{" "}
                              {safeGet<string>(property, "propertyId", "N/A")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">
                          {safeGet<string>(
                            property,
                            "location.neighborhood",
                            "Unknown"
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {safeGet<string>(
                            property,
                            "location.city",
                            "Unknown"
                          )}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">
                          ${(property.price || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            property.status
                          )}`}
                        >
                          {formatStatus(property.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-gray-900">
                          {safeGet<string>(property, "type", "Unknown")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              window.open(`/property/${property._id}`, "_blank")
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            title="View Property"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(property)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                            title="Edit Property"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="Delete Property"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-gray-500">
                      No properties found matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <PropertyForm
          property={editingProperty}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminProperties;
