// src/context/ConstructionProjectContext.tsx
/* eslint-disable react-refresh/only-export-components */

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

    // Always attempt a public fetch of projects (no auth required to list projects).
    // This prevents the admin listing from showing an authentication error when the user
    // hasn't logged in yet. Create/Update/Delete operations still require authentication.
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/projects`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Attempt to parse error message
        throw new Error(
          errorData.message ||
            `Failed to fetch construction projects: ${response.statusText}`
        );
      }

      const { data } = await response.json(); // Assuming response is { data: ConstructionProject[] }
      setProjects(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load construction projects.");
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
        // Append individual project fields so backend can read req.body.title, etc.
        if ((projectData as any).title !== undefined)
          formData.append("title", String((projectData as any).title));
        if ((projectData as any).description !== undefined)
          formData.append("description", String((projectData as any).description));
        if ((projectData as any).category !== undefined)
          formData.append("category", String((projectData as any).category));
        if ((projectData as any).completionDate !== undefined)
          formData.append("completionDate", String((projectData as any).completionDate));
        if ((projectData as any).location !== undefined)
          formData.append("location", String((projectData as any).location));
        if ((projectData as any).clientTestimonial !== undefined)
          formData.append(
            "clientTestimonial",
            String((projectData as any).clientTestimonial)
          );
        if ((projectData as any).services !== undefined) {
          const sv = (projectData as any).services;
          formData.append("services", Array.isArray(sv) ? sv.join(",") : String(sv));
        }

        // Append the image file(s) under 'images' to match multer.array('images')
        if (imageFile) {
          formData.append("images", imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/projects`, {
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to create construction project.");
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
        // Append individual fields to match backend parsing
        if ((projectData as any).title !== undefined)
          formData.append("title", String((projectData as any).title));
        if ((projectData as any).description !== undefined)
          formData.append("description", String((projectData as any).description));
        if ((projectData as any).category !== undefined)
          formData.append("category", String((projectData as any).category));
        if ((projectData as any).completionDate !== undefined)
          formData.append("completionDate", String((projectData as any).completionDate));
        if ((projectData as any).location !== undefined)
          formData.append("location", String((projectData as any).location));
        if ((projectData as any).clientTestimonial !== undefined)
          formData.append(
            "clientTestimonial",
            String((projectData as any).clientTestimonial)
          );
        if ((projectData as any).services !== undefined) {
          const sv = (projectData as any).services;
          formData.append("services", Array.isArray(sv) ? sv.join(",") : String(sv));
        }

        if (imageFile) {
          formData.append("images", imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to update construction project.");
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
          `${API_BASE_URL}/projects/${id}`,
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to delete construction project.");
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
        // The backend expects uploaded files under the 'images' field (array).
        const formData = new FormData();
        formData.append("images", file);

        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to upload image: ${response.statusText}`
          );
        }

        const { data } = await response.json(); // { data: project }
        // The backend appends new images to data.images; return the last added image URL
        const newImageUrl = Array.isArray(data.images) ? data.images.slice(-1)[0] : null;
        if (newImageUrl) {
          setProjects((prev) =>
            prev.map((project) =>
              project.id === projectId ? { ...project, images: data.images } : project
            )
          );
          return { url: newImageUrl };
        }
        return null;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to upload image.");
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
        // Backend does not provide a dedicated image-delete endpoint for projects.
        // Implementing image removal requires backend support to accept an updated images array.
        // For now, return not-supported and include projectId for better debug.
        setError(`Delete image is not supported by the current API for project ${projectId}.`);
        return false;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to delete image.");
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
