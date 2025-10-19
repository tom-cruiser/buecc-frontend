import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Property } from "../types";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

interface PropertiesContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  createProperty: (
    data: Omit<Property, "_id">,
    files?: File[]
  ) => Promise<Property | null>;
  updateProperty: (
    id: string,
    data: Partial<Property>,
    files?: File[]
  ) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  uploadPropertyImages: (
    propertyId: string,
    files: File[]
  ) => Promise<{ url: string; filename: string }[]>;
  deletePropertyImage: (
    propertyId: string,
    filename: string
  ) => Promise<boolean>;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(
  undefined
);

export const PropertiesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    if (isAuthLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setProperties([]);
      setError("Authentication required to fetch properties.");
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Missing authentication token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch properties: ${response.statusText}`
        );
      }

      const { data } = await response.json();
      setProperties(data);
    } catch (err: any) {
      setError(err.message || "Failed to load properties.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, getToken]);

  const createProperty = useCallback(
    async (propertyData: Omit<Property, "_id">, files?: File[]) => {
      if (!isAuthenticated) {
        setError("Authentication required to create property.");
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
        formData.append("property", JSON.stringify(propertyData));

        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append("images", file);
          });
        }

        const response = await fetch(`${API_BASE_URL}/properties`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to create property: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        setProperties((prev) => [...prev, data]);
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to create property.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const updateProperty = useCallback(
    async (id: string, propertyData: Partial<Property>, files?: File[]) => {
      if (!isAuthenticated) {
        setError("Authentication required to update property.");
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
        formData.append("property", JSON.stringify(propertyData));

        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append("images", file);
          });
        }

        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
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
              `Failed to update property: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        setProperties((prev) =>
          prev.map((property) =>
            property._id === id ? { ...property, ...data } : property
          )
        );
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update property.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete property.");
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
        const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to delete property: ${response.statusText}`
          );
        }

        setProperties((prev) => prev.filter((property) => property._id !== id));
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete property.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const uploadPropertyImages = useCallback(
    async (propertyId: string, files: File[]) => {
      if (!isAuthenticated) {
        setError("Authentication required to upload images.");
        return [];
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token.");
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file);
        });

        const response = await fetch(
          `${API_BASE_URL}/properties/${propertyId}/images`,
          {
            method: "POST",
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
              `Failed to upload images: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to upload images.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const deletePropertyImage = useCallback(
    async (propertyId: string, filename: string) => {
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
          `${API_BASE_URL}/properties/${propertyId}/images/${filename}`,
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

        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete image.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  useEffect(() => {
    if (!isAuthLoading) {
      fetchProperties();
    }
  }, [fetchProperties, isAuthLoading]);

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        loading,
        error,
        fetchProperties,
        createProperty,
        updateProperty,
        deleteProperty,
        uploadPropertyImages,
        deletePropertyImage,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (context === undefined) {
    throw new Error("useProperties must be used within a PropertiesProvider");
  }
  return context;
};
