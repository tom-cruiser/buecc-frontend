// src/context/ConstructionProjectContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { ConstructionProject } from "../types"; // Adjust path as needed
import { useAuth } from "./AuthContext"; // Assuming you have an AuthContext

const API_BASE_URL = "http://localhost:5000/api"; // Ensure this matches your backend API base URL

interface ConstructionProjectContextType {
  projects: ConstructionProject[];
  loading: boolean;
  error: string | null;
  fetchConstructionProjects: () => Promise<void>;
  createConstructionProject: (
    data: Omit<ConstructionProject, "id" | "image">, // 'id' and 'image' handled separately
    imageFile?: File | null // Optional image file for upload
  ) => Promise<ConstructionProject | null>;
  updateConstructionProject: (
    id: string,
    data: Partial<Omit<ConstructionProject, "image">>, // 'image' is handled by imageFile
    imageFile?: File | null // Optional new image file for update
  ) => Promise<ConstructionProject | null>;
  deleteConstructionProject: (id: string) => Promise<boolean>;
  uploadConstructionProjectImage: (
    projectId: string,
    file: File
  ) => Promise<{ url: string } | null>; // Returns the new image URL
  deleteConstructionProjectImage: (projectId: string) => Promise<boolean>; // Deletes the project's current image
}

const ConstructionProjectContext = createContext<
  ConstructionProjectContextType | undefined
>(undefined);

export const ConstructionProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken } = useAuth();
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches all construction projects from the backend
  const fetchConstructionProjects = useCallback(async () => {
    // Prevent fetching if authentication status is still loading
    if (isAuthLoading) {
      setLoading(true);
      return;
    }

    // If not authenticated, clear projects and set error
    if (!isAuthenticated) {
      setProjects([]);
      setError("Authentication required to fetch construction projects.");
      setLoading(false);
      return;
    }

    // Get authentication token
    const token = getToken();
    if (!token) {
      setError("Missing authentication token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/construction-projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Important for GET requests expecting JSON
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Attempt to parse error message
        throw new Error(
          errorData.message ||
            `Failed to fetch construction projects: ${response.statusText}`
        );
      }

      const { data } = await response.json(); // Assuming response is { data: ConstructionProject[] }
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load construction projects.");
      setProjects([]); // Clear projects on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, getToken]); // Dependencies for useCallback

  // Creates a new construction project
  const createConstructionProject = useCallback(
    async (
      projectData: Omit<ConstructionProject, "id" | "image">,
      imageFile?: File | null
    ) => {
      if (!isAuthenticated) {
        setError("Authentication required to create construction project.");
        return null;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        // Append project data as a JSON string
        formData.append("project", JSON.stringify(projectData));

        // Append the image file if provided
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/construction-projects`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set 'Content-Type': 'multipart/form-data' here.
            // The browser sets it automatically with the correct boundary when using FormData.
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to create construction project: ${response.statusText}`
          );
        }

        const { data } = await response.json(); // Assuming response is { data: ConstructionProject }
        setProjects((prev) => [...prev, data]); // Add new project to state
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to create construction project.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  ); // Dependencies for useCallback

  // Updates an existing construction project
  const updateConstructionProject = useCallback(
    async (
      id: string,
      projectData: Partial<Omit<ConstructionProject, "image">>,
      imageFile?: File | null
    ) => {
      if (!isAuthenticated) {
        setError("Authentication required to update construction project.");
        return null;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        // Append project data as a JSON string
        formData.append("project", JSON.stringify(projectData));

        // Append the new image file if provided
        if (imageFile) {
          formData.append("image", imageFile);
        }

        const response = await fetch(
          `${API_BASE_URL}/construction-projects/${id}`,
          {
            method: "PATCH", // Or PUT, depending on your API design
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to update construction project: ${response.statusText}`
          );
        }

        const { data } = await response.json(); // Assuming response is { data: ConstructionProject }
        setProjects((prev) =>
          prev.map(
            (project) => (project.id === id ? { ...project, ...data } : project) // Update project in state
          )
        );
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update construction project.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  ); // Dependencies for useCallback

  // Deletes a construction project
  const deleteConstructionProject = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete construction project.");
        return false;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/construction-projects/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to delete construction project: ${response.statusText}`
          );
        }

        setProjects((prev) => prev.filter((project) => project.id !== id)); // Remove project from state
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete construction project.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  ); // Dependencies for useCallback

  // Uploads/replaces a single image for a specific project
  const uploadConstructionProjectImage = useCallback(
    async (projectId: string, file: File) => {
      if (!isAuthenticated) {
        setError("Authentication required to upload image.");
        return null;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", file); // Key should match backend's expected field name

        const response = await fetch(
          `${API_BASE_URL}/construction-projects/${projectId}/image`,
          {
            method: "POST", // Or PUT if it's always replacing
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to upload image: ${response.statusText}`
          );
        }

        const { url } = await response.json(); // Assuming response is { url: "..." }
        // Update the specific project's image URL in the state
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId ? { ...project, image: url } : project
          )
        );
        return { url };
      } catch (err: any) {
        setError(err.message || "Failed to upload image.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  ); // Dependencies for useCallback

  // Deletes the current image for a specific project
  const deleteConstructionProjectImage = useCallback(
    async (projectId: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete image.");
        return false;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/construction-projects/${projectId}/image`, // Endpoint to delete the image
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to delete image: ${response.statusText}`
          );
        }

        // Update the specific project's image URL to an empty string or null in the state
        setProjects((prev) =>
          prev.map(
            (project) =>
              project.id === projectId ? { ...project, image: "" } : project // Set image to empty string
          )
        );
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete image.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  ); // Dependencies for useCallback

  // Effect to fetch projects when authentication status changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchConstructionProjects();
    }
  }, [fetchConstructionProjects, isAuthLoading]); // Dependencies for useEffect

  return (
    <ConstructionProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchConstructionProjects,
        createConstructionProject,
        updateConstructionProject,
        deleteConstructionProject,
        uploadConstructionProjectImage,
        deleteConstructionProjectImage,
      }}
    >
      {children}
    </ConstructionProjectContext.Provider>
  );
};

// Custom hook to consume the ConstructionProjectContext
export const useConstructionProjects = () => {
  const context = useContext(ConstructionProjectContext);
  if (context === undefined) {
    throw new Error(
      "useConstructionProjects must be used within a ConstructionProjectProvider"
    );
  }
  return context;
};
