// src/pages/admin/AdminDashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Building,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Mail,
  MessageCircle,
  Calendar,
  ArrowRight,
  RefreshCw,
  Loader2, // Added for loading spinner
  AlertCircle, // Added for error icon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperties } from "../../context/PropertyContext";
import { useInquiries } from "../../context/InquiriesContext";
import { StatCard } from "../../components/admin/StatCard";
import { RecentTable } from "../../components/admin/RecentTable";
import { ActivityFeed } from "../../components/admin/ActivityFeed";
import { QuickActions } from "../../components/admin/QuickActions";

const AdminDashboard = () => {
  // Destructure isLoading from useAuth
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    properties,
    loading: propsLoading,
    fetchProperties,
  } = useProperties();
  const { inquiries, loading: inqLoading, fetchInquiries } = useInquiries();
  const navigate = useNavigate();

  // Combined data loading state for the component's content
  const isDataLoading = propsLoading || inqLoading;

  // Data refresh logic
  const refreshData = async () => {
    // Only refresh data if authenticated
    if (isAuthenticated) {
      await Promise.all([fetchProperties(), fetchInquiries()]);
    }
  };

  // Effect to handle authentication status and initial data fetch
  useEffect(() => {
    // 1. If AuthContext is still loading, do nothing yet.
    if (isAuthLoading) {
      return;
    }

    // 2. If not authenticated after AuthContext has finished loading, redirect.
    if (!isAuthenticated) {
      navigate("/admin/login");
      return; // Stop further execution in this effect
    }

    // 3. If authenticated, fetch the dashboard data.
    // This will run once isAuthenticated becomes true after initial auth check.
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, isAuthLoading, navigate]); // Add isAuthLoading and navigate to dependencies

  // --- Render Loading/Error States ---
  // Show a full-page loader while authentication status is being determined.
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={64} />
        <p className="ml-4 text-xl text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  // If we reach here and not authenticated, the useEffect should have redirected.
  // This block is a safeguard or for development debugging if redirection fails.
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
        <p className="mb-4">You are not logged in. Redirecting...</p>
      </div>
    );
  }

  // Stats calculations (now inside component, ensures latest `properties` and `inquiries` states are used)
  const stats = {
    totalProperties: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    portfolioValue: properties.reduce((sum, p) => sum + p.price, 0),
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    featured: properties.filter((p) => p.featured).length,
    recentActivity: [...properties, ...inquiries]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
  };

  return (
    <div className="space-y-6 px-6 sm:px-8 lg:px-12">
      {/* Header with welcome and refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">
            Today is {new Date().toLocaleDateString("en-BI")}
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          disabled={isDataLoading} // Disable refresh button while data is loading
        >
          {isDataLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          {isDataLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass individual loading states or a combined one if StatCard needs it */}
        <StatCard
          icon={Building}
          title="Total Properties"
          value={
            isDataLoading ? (
              <Loader2 size={24} className="animate-spin text-blue-500" />
            ) : (
              stats.totalProperties
            )
          }
          trend="up"
          change="2% from last month"
          link="/admin/properties"
        />

        <StatCard
          icon={DollarSign}
          title="Portfolio Value"
          value={
            isDataLoading ? (
              <Loader2 size={24} className="animate-spin text-yellow-500" />
            ) : (
              `$${stats.portfolioValue.toLocaleString()}`
            )
          }
          trend="up"
          change="5% increase"
        />

        <StatCard
          icon={Mail}
          title="New Inquiries"
          value={
            isDataLoading ? (
              <Loader2 size={24} className="animate-spin text-red-500" />
            ) : (
              stats.newInquiries
            )
          }
          trend="down"
          change="10% decrease"
          link="/admin/inquiries"
          alert={stats.newInquiries > 0}
        />

        <StatCard
          icon={TrendingUp}
          title="Featured Listings"
          value={
            isDataLoading ? (
              <Loader2 size={24} className="animate-spin text-green-500" />
            ) : (
              stats.featured
            )
          }
          link="/admin/properties?featured=true"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Properties</h2>
            <button
              onClick={() => navigate("/admin/properties")}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              View all <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <RecentTable
            data={properties.slice(0, 5)}
            columns={["title", "status", "price"]}
            loading={propsLoading} // Keep individual loading for RecentTable
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions
            actions={[
              {
                icon: Plus,
                label: "Add Property",
                onClick: () => navigate("/admin/properties/"),
              },
              {
                icon: MessageCircle,
                label: "Respond to Inquiries",
                onClick: () => navigate("/admin/inquiries"),
              },
              {
                icon: Calendar,
                label: "Schedule Viewing",
                onClick: () => navigate("/admin/schedule"),
              },
            ]}
          />

          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ActivityFeed items={stats.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
