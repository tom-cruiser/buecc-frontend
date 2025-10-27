import React, { useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import PropertyModal from "./PropertyModal";
import { Property } from "../types";
import { ArrowRight } from "lucide-react";
import config from "../config/config";

const FeaturedProperties: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${config.API_ENDPOINT}/properties?featured=true`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text();
          console.error("Non-JSON response received:", responseText);
          throw new Error("Server returned non-JSON response");
        }

        const rawData = await response.json();

        // Enhanced debugging logs
        console.log("=== API Response Debug Info ===");
        console.log("Raw API Response:", rawData);
        console.log("Type of rawData:", typeof rawData);
        console.log("Is rawData an array?", Array.isArray(rawData));

        if (rawData && typeof rawData === "object") {
          console.log("rawData keys:", Object.keys(rawData));
          console.log("rawData structure:", JSON.stringify(rawData, null, 2));
        }
        console.log("=== End Debug Info ===");

        let propertiesToSet: Property[] = [];

        // Handle different possible response formats
        if (rawData === null || rawData === undefined) {
          console.warn("API returned null/undefined");
          propertiesToSet = [];
        } else if (Array.isArray(rawData)) {
          // Direct array of properties
          console.log("Response is an array with", rawData.length, "items");
          propertiesToSet = rawData;
        } else if (rawData && typeof rawData === "object") {
          // Check for common wrapper patterns
          if (rawData.data && Array.isArray(rawData.data)) {
            // Format: { data: [...] }
            console.log(
              "Response has data array with",
              rawData.data.length,
              "items"
            );
            propertiesToSet = rawData.data;
          } else if (rawData.properties && Array.isArray(rawData.properties)) {
            // Format: { properties: [...] }
            console.log(
              "Response has properties array with",
              rawData.properties.length,
              "items"
            );
            propertiesToSet = rawData.properties;
          } else if (rawData.results && Array.isArray(rawData.results)) {
            // Format: { results: [...] }
            console.log(
              "Response has results array with",
              rawData.results.length,
              "items"
            );
            propertiesToSet = rawData.results;
          } else if (rawData.id || rawData._id) {
            // Single property object
            console.log("Response is a single property object");
            propertiesToSet = [rawData as Property];
          } else {
            // Check if it's a paginated response
            if (rawData.items && Array.isArray(rawData.items)) {
              console.log(
                "Response has items array with",
                rawData.items.length,
                "items"
              );
              propertiesToSet = rawData.items;
            } else {
              // Log the actual structure for debugging
              console.error("Unexpected response structure:", {
                keys: Object.keys(rawData),
                sampleData: rawData,
              });
              throw new Error(
                `Unexpected API response format. Expected array or object with properties, got: ${JSON.stringify(
                  Object.keys(rawData)
                )}`
              );
            }
          }
        } else {
          throw new Error(
            `Invalid response type. Expected object or array, got: ${typeof rawData}`
          );
        }

        // Validate that we have valid property objects
        const validProperties = propertiesToSet.filter((property) => {
          const hasId = property.id || property._id;
          const hasRequiredFields = property.title && property.price;

          if (!hasId || !hasRequiredFields) {
            console.warn("Invalid property object found:", property);
            return false;
          }
          return true;
        });

        if (validProperties.length !== propertiesToSet.length) {
          console.warn(
            `Filtered out ${
              propertiesToSet.length - validProperties.length
            } invalid properties`
          );
        }

        console.log("Setting", validProperties.length, "featured properties");
        setFeaturedProperties(validProperties);
      } catch (err) {
        console.error("Error in fetchFeaturedProperties:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching properties");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
  };

  const closeModal = () => {
    setSelectedProperty(null);
  };

  if (loading) {
    return (
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">
              Loading featured properties...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Properties
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProperties.length === 0) {
    return (
      <section id="properties" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                No Featured Properties
              </h3>
              <p className="text-yellow-700">
                No featured properties are available at the moment.
              </p>
              <p className="text-yellow-600 text-sm mt-2">
                Check back later or explore other listings.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="properties" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of premium properties in
            Bujumbura's most desirable locations
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id || property._id}
              property={property}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* View All Properties Button */}
        <div className="text-center">
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-lg inline-flex items-center"
            onClick={() => {
              // Add navigation logic here if needed
              console.log("Navigate to all properties");
            }}
          >
            View All Properties
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </div>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={closeModal} />
      )}
    </section>
  );
};

export default FeaturedProperties;
