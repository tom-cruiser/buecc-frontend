import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Award,
  Clock,
  ArrowRight,
  Quote,
} from "lucide-react";

// Define project type based on your API response
interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  completionDate: string;
  location: string;
  clientTestimonial?: string;
  services: string[];
  images: string[];
}

const ConstructionServices: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects");

        // If server returns non-OK, attempt to parse body for more info
        if (!response.ok) {
          let bodyText = "";
          try {
            const body = await response.text();
            bodyText = body;
          } catch {
            bodyText = "<unreadable response body>";
          }
          console.error(
            `Projects API returned non-OK: ${response.status} ${response.statusText} - ${bodyText}`
          );
          setError(
            `Failed to load projects (server ${response.status}). Please try again later.`
          );
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProjects(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        // Provide a slightly more specific message including any Error.message
        const message = err instanceof Error ? err.message : String(err);
        setError(`Failed to load projects: ${message}`);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Helper function to format image URLs from the backend
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}`;
    }

    return imagePath;
  };

  return (
    <section id="construction" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Construction & Engineering Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From concept to completion, we deliver world-class construction and
            civil engineering solutions across Burundi
          </p>
        </div>

        {/* Services Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Architectural Design</h3>
            <p className="text-gray-600">
              Innovative and sustainable architectural solutions tailored to
              your vision
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Project Management</h3>
            <p className="text-gray-600">
              Expert project management ensuring on-time and on-budget delivery
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-orange-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Quality Assurance</h3>
            <p className="text-gray-600">
              Rigorous quality control processes and premium materials
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-purple-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Timely Delivery</h3>
            <p className="text-gray-600">
              Committed to meeting deadlines without compromising quality
            </p>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Recent Projects
          </h3>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading projects...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No projects available at the moment.
              </p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.slice(0, 4).map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64">
                    <img
                      src={
                        project.images && project.images.length > 0
                          ? getImageUrl(project.images[0])
                          : "https://via.placeholder.com/600x400?text=No+Image"
                      }
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {project.category || "General"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2">
                      {project.title}
                    </h4>
                    <p className="text-gray-600 mb-4">{project.description}</p>

                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{project.location || "Burundi"}</span>
                      <span>
                        Completed:{" "}
                        {project.completionDate
                          ? new Date(
                              project.completionDate
                            ).toLocaleDateString()
                          : "Ongoing"}
                      </span>
                    </div>

                    {/* Services Tags */}
                    {project.services && project.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.services
                          .slice(0, 3)
                          .map((service, serviceIndex) => (
                            <span
                              key={serviceIndex}
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
                    )}

                    {/* Client Testimonial */}
                    {project.clientTestimonial && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Quote className="text-gray-400 mb-2" size={16} />
                        <p className="text-sm text-gray-600 italic">
                          "{project.clientTestimonial}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && projects.length > 4 && (
            <div className="text-center mt-8">
              <a
                href="/projects"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View all projects
                <ArrowRight className="ml-2" size={16} />
              </a>
            </div>
          )}
        </div>

        {/* Construction Process */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12 mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Construction Process
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold mb-2">Consultation</h4>
              <p className="text-gray-600">
                Initial meeting to understand your needs and vision
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold mb-2">Design & Planning</h4>
              <p className="text-gray-600">
                Detailed architectural plans and engineering designs
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold mb-2">Construction</h4>
              <p className="text-gray-600">
                Skilled craftsmen bring your project to life
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold mb-2">Handover</h4>
              <p className="text-gray-600">
                Final inspection and project delivery
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Construction Project?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Get a free consultation and quote for your next project
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-lg inline-flex items-center">
            Get Free Consultation
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConstructionServices;
