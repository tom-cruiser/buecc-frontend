import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Inquiry } from "../types";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:5000/api";
const REQUEST_TIMEOUT = 10000;

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = REQUEST_TIMEOUT
) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
};

interface InquiriesContextType {
  inquiries: Inquiry[];
  loading: boolean;
  error: string | null;
  fetchInquiries: () => Promise<void>;
  createInquiry: (data: Omit<Inquiry, "_id">) => Promise<Inquiry | null>;
  updateInquiry: (
    id: string,
    data: Partial<Inquiry>
  ) => Promise<Inquiry | null>;
  deleteInquiry: (id: string) => Promise<boolean>;
}

const InquiriesContext = createContext<InquiriesContextType | undefined>(
  undefined
);

export const InquiriesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setInquiries([]);
      setError("Authentication required");
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Missing authentication token");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/inquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch inquiries");
      }

      const { data } = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      setInquiries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, getToken]);

  const createInquiry = useCallback(
    async (inquiryData: Omit<Inquiry, "_id">) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/inquiries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inquiryData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to create inquiry");
        }

        const { data } = await response.json();
        setInquiries((prev) => [...prev, data]);
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to create inquiry");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteInquiry = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError("Authentication required");
        return false;
      }

      const token = getToken();
      if (!token) {
        setError("Missing authentication token");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/inquiries/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to delete inquiry");
        }

        setInquiries((prev) => prev.filter((inquiry) => inquiry._id !== id));
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete inquiry");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <InquiriesContext.Provider
      value={{
        inquiries,
        loading,
        error,
        fetchInquiries,
        createInquiry,
        deleteInquiry,
      }}
    >
      {children}
    </InquiriesContext.Provider>
  );
};

export function useInquiries() {
  const context = useContext(InquiriesContext);
  if (context === undefined) {
    throw new Error("useInquiries must be used within an InquiriesProvider");
  }
  return context;
}
