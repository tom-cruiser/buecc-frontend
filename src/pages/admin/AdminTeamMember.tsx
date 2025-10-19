import React, { useState, useEffect } from "react";
import { useTeamMembers } from "../../context/TeamMemberContext";
import { useAuth } from "../../context/AuthContext";
import { TeamMember } from "../../types";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import TeamMemberForm from "../../components/admin/TeamMemberForm";
import { useNavigate } from "react-router-dom";

const AdminTeamMembers: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const {
    teamMembers,
    loading: membersLoading,
    error: membersError,
    deleteTeamMember,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
  } = useTeamMembers();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  const getImageUrl = (member: TeamMember): string => {
    if (!member?.image) {
      return "/placeholder-member.jpg";
    }

    // Handle both development and production environments
    if (member.image.startsWith("/uploads/")) {
      return process.env.NODE_ENV === "production"
        ? `${window.location.origin}${member.image}`
        : `http://localhost:5000${member.image}`;
    }

    return member.image || "/placeholder-member.jpg";
  };

  const filteredMembers = teamMembers.filter((member) => {
    if (!member) return false;

    const name = member.name.toLowerCase();
    const role = member.role.toLowerCase();
    const bio = member.bio.toLowerCase();

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      role.includes(searchTerm.toLowerCase()) ||
      bio.includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) navigate("/admin/login");
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      setActionError(null);
      try {
        const success = await deleteTeamMember(id);
        if (!success) {
          setActionError("Failed to delete team member. Please try again.");
        }
      } catch (error) {
        setActionError("An error occurred while deleting the team member.");
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleFormSubmit = async (memberData: Partial<TeamMember>) => {
    setActionError(null);
    try {
      if (editingMember && editingMember.id) {
        const result = await updateTeamMember(editingMember.id, memberData);
        if (!result) throw new Error("Failed to update team member");
      } else {
        const result = await createTeamMember(memberData);
        if (!result) throw new Error("Failed to create team member");
      }
      handleCloseForm();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  const getRoleColor = (role: string = "") => {
    switch (role.toLowerCase()) {
      case "broker":
        return "bg-purple-100 text-purple-800";
      case "agent":
        return "bg-blue-100 text-blue-800";
      case "assistant":
        return "bg-green-100 text-green-800";
      case "manager":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  if (membersError) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p className="mb-4">{membersError}</p>
        <button
          onClick={fetchTeamMembers}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (membersLoading && teamMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="ml-4 text-lg text-gray-700">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Team Member
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
              placeholder="Search by name, role, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="Broker">Broker</option>
            <option value="Agent">Agent</option>
            <option value="Assistant">Assistant</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Team Member
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Role
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Bio
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Specialties
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {membersLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={32}
                    />
                    <p className="mt-2 text-gray-600">
                      Loading team members...
                    </p>
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const imageUrl = getImageUrl(member);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-member.jpg";
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
                              {member.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900 line-clamp-2">
                          {member.bio}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          {member.specialties?.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                            title="Edit Team Member"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="Delete Team Member"
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
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-gray-500">
                      No team members found matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminTeamMembers;
