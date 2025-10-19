// src/pages/admin/AdminConstruction.tsx
import React, { useState, useEffect } from "react";
import { useConstructionProjects } from "../../context/ConstructionProjectContext";
import ConstructionProjectForm from "../../components/admin/ConstructionProjectForm";
import { ConstructionProject } from "../../types";

const AdminConstruction: React.FC = () => {
  const {
    projects,
    loading,
    error,
    fetchConstructionProjects,
    createConstructionProject,
    updateConstructionProject,
    deleteConstructionProject,
  } = useConstructionProjects();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] =
    useState<ConstructionProject | null>(null);
  useEffect(() => {
    fetchConstructionProjects();
  }, [fetchConstructionProjects]);

  const handleOpenModal = (project?: ConstructionProject) => {
    setEditingProject(project || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteConstructionProject(id);
    }
  };

  // Note: project schema uses category, completionDate, images and services.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Construction Projects
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Project
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
                {project.images && project.images.length > 0 && (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                {project.description}
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {project.location}
                </p>
                <p>
                  <span className="font-medium">Category:</span> {project.category}
                </p>
                <p>
                  <span className="font-medium">Completion Date:</span>{" "}
                  {project.completionDate
                    ? new Date(project.completionDate).toLocaleDateString()
                    : "N/A"}
                </p>
                {project.clientTestimonial && (
                  <p>
                    <span className="font-medium">Testimonial:</span> {project.clientTestimonial}
                  </p>
                )}
                {project.services && project.services.length > 0 && (
                  <div>
                    <span className="font-medium">Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {project.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{project.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenModal(project)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No construction projects found.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Project
          </button>
        </div>
      )}

      {/* Modal - use shared ConstructionProjectForm component */}
      {showModal && (
        <ConstructionProjectForm
          initialData={editingProject}
          onClose={handleCloseModal}
          isLoading={loading}
          onSubmit={async (projectPayload, imageFileParam) => {
            // projectPayload may include an 'image' field; remove it before sending
            const { image, id: maybeId, ...payload } = projectPayload as any;
            let result = null as any;
            if (editingProject) {
              result = await updateConstructionProject(editingProject.id, payload, imageFileParam ?? null);
            } else {
              result = await createConstructionProject(payload as any, imageFileParam ?? null);
            }
            if (result) handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

export default AdminConstruction;
