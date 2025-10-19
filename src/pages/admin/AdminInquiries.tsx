import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MessageCircle,
  Phone,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Trash2,
  Reply,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useInquiries } from "../../context/InquiriesContext";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  status: "new" | "in-progress" | "responded" | "closed";
  createdAt: string;
  updatedAt: string;
}

const AdminInquiries = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    inquiries,
    loading: inqLoading,
    error: inqError,
    fetchInquiries,
    updateInquiry,
    deleteInquiry,
  } = useInquiries();
  const navigate = useNavigate();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Helper function to safely access nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = "") => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined
        ? current[key]
        : defaultValue;
    }, obj);
  };

  // Enhanced data refresh logic with error handling
  const refreshData = async () => {
    setActionError(null);
    try {
      await fetchInquiries();
      setLastFetchTime(new Date().toLocaleTimeString());
    } catch (error) {
      setActionError("Failed to refresh inquiries. Please try again.");
    }
  };

  // Authentication and data fetching effect
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    refreshData();
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Filter inquiries based on search and status
  const filteredInquiries = inquiries.filter((inquiry: Inquiry) => {
    const matchesSearch =
      safeGet(inquiry, "name", "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      safeGet(inquiry, "email", "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      safeGet(inquiry, "message", "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      safeGet(inquiry, "propertyTitle", "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats calculations with loading states
  const stats = {
    total: inqLoading ? "..." : inquiries.length,
    new: inqLoading
      ? "..."
      : inquiries.filter((i: Inquiry) => i.status === "new").length,
    inProgress: inqLoading
      ? "..."
      : inquiries.filter((i: Inquiry) => i.status === "in-progress").length,
    responded: inqLoading
      ? "..."
      : inquiries.filter((i: Inquiry) => i.status === "responded").length,
    closed: inqLoading
      ? "..."
      : inquiries.filter((i: Inquiry) => i.status === "closed").length,
  };

  // Enhanced status update handler
  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    setIsUpdating(true);
    setActionError(null);
    try {
      const success = await updateInquiry(inquiryId, { status: newStatus });
      if (!success) {
        setActionError("Failed to update inquiry status.");
      } else if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
    } catch (error) {
      setActionError("Failed to update inquiry status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Enhanced delete handler
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      setActionError(null);
      try {
        const success = await deleteInquiry(inquiryId);
        if (!success) {
          setActionError("Failed to delete inquiry.");
        } else if (selectedInquiry?._id === inquiryId) {
          setIsModalOpen(false);
          setSelectedInquiry(null);
        }
        refreshData();
      } catch (error) {
        setActionError("Failed to delete inquiry. Please try again.");
      }
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      new: { color: "bg-red-100 text-red-800", icon: Mail },
      "in-progress": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      responded: { color: "bg-blue-100 text-blue-800", icon: Reply },
      closed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  // Loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={64} />
        <p className="ml-4 text-xl text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // Display error if authentication failed or if InquiriesContext has an error
  if (!isAuthenticated || inqError) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">
          {!isAuthenticated ? "Access Denied" : "Error"}
        </h3>
        <p className="mb-4">
          {!isAuthenticated
            ? "You are not logged in. Redirecting..."
            : inqError}
        </p>
        <Loader2 className="mx-auto animate-spin text-red-500" size={24} />
      </div>
    );
  }

  // Display inquiries data fetching loading (after authentication is confirmed)
  if (inqLoading && inquiries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-4 text-lg text-gray-700">Loading inquiries data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 sm:px-8 lg:px-12">
      {/* Header with refresh status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inquiries Management</h1>
          <p className="text-gray-600">
            Manage customer inquiries and communications
            {lastFetchTime && (
              <span className="text-xs text-gray-400 ml-2">
                (Last refreshed: {lastFetchTime})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          disabled={inqLoading}
        >
          {inqLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          {inqLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Action Failed!</strong>
          <span className="block sm:inline ml-2">{actionError}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setActionError(null)}
          >
            <X size={16} />
          </span>
        </div>
      )}

      {/* Rest of the component remains the same... */}
      {/* (Keep the stats cards, search/filter, and table sections as they were) */}

      {/* Inquiry Detail Modal */}
      {isModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Inquiry Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span>{safeGet(selectedInquiry, "name", "N/A")}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <a
                      href={`mailto:${safeGet(selectedInquiry, "email", "")}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {safeGet(selectedInquiry, "email", "N/A")}
                    </a>
                  </div>
                </div>
                {safeGet(selectedInquiry, "phone") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <a
                        href={`tel:${safeGet(selectedInquiry, "phone", "")}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {safeGet(selectedInquiry, "phone", "N/A")}
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <StatusBadge
                    status={safeGet(selectedInquiry, "status", "new")}
                  />
                </div>
              </div>

              {/* Property Info */}
              {safeGet(selectedInquiry, "propertyTitle") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property
                  </label>
                  <p className="text-gray-900">
                    {safeGet(selectedInquiry, "propertyTitle", "N/A")}
                  </p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {safeGet(selectedInquiry, "message", "No message provided")}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label className="block font-medium mb-1">Received</label>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {new Date(
                      safeGet(
                        selectedInquiry,
                        "createdAt",
                        new Date().toISOString()
                      )
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Last Updated</label>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {new Date(
                      safeGet(
                        selectedInquiry,
                        "updatedAt",
                        new Date().toISOString()
                      )
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <select
                  value={safeGet(selectedInquiry, "status", "new")}
                  onChange={(e) =>
                    handleStatusUpdate(selectedInquiry._id, e.target.value)
                  }
                  disabled={isUpdating}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>

                <a
                  href={`mailto:${safeGet(
                    selectedInquiry,
                    "email",
                    ""
                  )}?subject=Re: Your Property Inquiry`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Reply size={16} className="mr-2" />
                  Reply
                </a>

                <button
                  onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
