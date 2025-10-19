import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { TeamMember } from "../types";
import { useAuth } from "./AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

interface TeamMemberContextType {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  createTeamMember: (
    data: Omit<TeamMember, "id">,
    imageFile?: File
  ) => Promise<TeamMember | null>;
  updateTeamMember: (
    id: string,
    data: Partial<TeamMember>,
    imageFile?: File
  ) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  uploadTeamMemberImage: (
    memberId: string,
    file: File
  ) => Promise<{ url: string; filename: string } | null>;
  deleteTeamMemberImage: (
    memberId: string,
    filename: string
  ) => Promise<boolean>;
}

const TeamMemberContext = createContext<TeamMemberContextType | undefined>(
  undefined
);

export const TeamMemberProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    if (isAuthLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setTeamMembers([]);
      setError("Authentication required to fetch team members.");
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
      const response = await fetch(`${API_BASE_URL}/team-members`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch team members: ${response.statusText}`
        );
      }

      const { data } = await response.json();
      setTeamMembers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load team members.");
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, getToken]);

  const createTeamMember = useCallback(
    async (memberData: Omit<TeamMember, "id">, imageFile?: File) => {
      if (!isAuthenticated) {
        setError("Authentication required to create team member.");
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
        formData.append("teamMember", JSON.stringify(memberData));

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/team-members`, {
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
              `Failed to create team member: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        setTeamMembers((prev) => [...prev, data]);
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to create team member.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const updateTeamMember = useCallback(
    async (id: string, memberData: Partial<TeamMember>, imageFile?: File) => {
      if (!isAuthenticated) {
        setError("Authentication required to update team member.");
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
        formData.append("teamMember", JSON.stringify(memberData));

        if (imageFile) {
          formData.append("image", imageFile);
        }

        const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
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
              `Failed to update team member: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === id ? { ...member, ...data } : member
          )
        );
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to update team member.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const deleteTeamMember = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete team member.");
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
        const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to delete team member: ${response.statusText}`
          );
        }

        setTeamMembers((prev) => prev.filter((member) => member.id !== id));
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete team member.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const uploadTeamMemberImage = useCallback(
    async (memberId: string, file: File) => {
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
        formData.append("image", file);

        const response = await fetch(
          `${API_BASE_URL}/team-members/${memberId}/image`,
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
              `Failed to upload image: ${response.statusText}`
          );
        }

        const { data } = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to upload image.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getToken]
  );

  const deleteTeamMemberImage = useCallback(
    async (memberId: string, filename: string) => {
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
          `${API_BASE_URL}/team-members/${memberId}/image/${filename}`,
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
      fetchTeamMembers();
    }
  }, [fetchTeamMembers, isAuthLoading]);

  return (
    <TeamMemberContext.Provider
      value={{
        teamMembers,
        loading,
        error,
        fetchTeamMembers,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        uploadTeamMemberImage,
        deleteTeamMemberImage,
      }}
    >
      {children}
    </TeamMemberContext.Provider>
  );
};

export const useTeamMembers = () => {
  const context = useContext(TeamMemberContext);
  if (context === undefined) {
    throw new Error("useTeamMembers must be used within a TeamMemberProvider");
  }
  return context;
};
