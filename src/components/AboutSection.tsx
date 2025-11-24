import React, { useEffect, useState } from "react";
import config from "../config/config";
import {
  Award,
  Users,
  Building,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";

// Define the TeamMember type
type TeamMember = {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties?: string[];
};

const AboutSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members from API
  const API_BASE_URL = config.API_BASE_URL;

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/team-members`);

        if (!response.ok) {
          throw new Error(`Failed to load team members: ${response.status}`);
        }

        const data = await response.json();

        // Handle both direct array and { data: array } formats
        const members = Array.isArray(data) ? data : data.data || [];
        setTeamMembers(members);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(`Failed to load team members: ${message}`);
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [API_BASE_URL]);

  // Use centralized image URL helper
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return "/placeholder-member.jpg";
    return config.getImageUrl(imagePath) || "/placeholder-member.jpg";
  };

  // Component to render individual team member
  const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const imageUrl = getImageUrl(member.image);

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Image Container */}
        <div className="relative overflow-hidden h-64">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={member.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-member.jpg";
                e.currentTarget.className =
                  "w-full h-full object-cover bg-gray-100";
              }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {member.name}
          </h4>
          <p className="text-blue-600 font-medium mb-3">{member.role}</p>
          <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

          {/* Specialties */}
          {member.specialties && member.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {member.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About BUECC</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building Burundi's future through innovative construction solutions
            and premium real estate services since 2009
          </p>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-blue-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
            <div className="text-gray-600">Years of Experience</div>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="text-green-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">200+</div>
            <div className="text-gray-600">Projects Completed</div>
          </div>

          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-orange-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Happy Clients</div>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-purple-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
            <div className="text-gray-600">Awards Won</div>
          </div>
        </div>

        {/* Company Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
            <p className="text-gray-600 mb-4">
              Founded in 2009, Burundi Engineering, Construction & Consulting
              (BUECC) has been at the forefront of transforming Burundi's
              architectural landscape. What started as a small engineering firm
              has grown into one of the country's most trusted names in
              construction and real estate.
            </p>
            <p className="text-gray-600 mb-4">
              Our commitment to excellence, innovation, and client satisfaction
              has earned us recognition across East Africa. We combine
              international standards with local expertise to deliver projects
              that stand the test of time.
            </p>
            <p className="text-gray-600">
              Today, we continue to push boundaries in sustainable construction,
              smart building technologies, and innovative real estate solutions
              that meet the evolving needs of modern Burundi.
            </p>
          </div>

          <div>
            <img
              src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="BUECC Office Building"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-office.jpg";
                e.currentTarget.className =
                  "w-full h-full object-cover bg-gray-100 rounded-2xl shadow-lg";
              }}
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600">
              To provide exceptional construction and real estate services that
              exceed client expectations while contributing to Burundi's
              sustainable development through innovative, high-quality projects
              that enhance communities and preserve the environment.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600">
              To be East Africa's leading construction and real estate company,
              recognized for our commitment to excellence, innovation, and
              sustainable development practices that create lasting value for
              our clients and communities.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Meet Our Leadership Team
          </h3>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading team members...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}

          {!loading && !error && teamMembers.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 text-lg">
                  No team members available at the moment.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && teamMembers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Values */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Core Values
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3">Honesty</h4>
              <p className="text-gray-600">
                We prioritize honesty and transparency in all interactions,
                building trust and delivering authentic results with integrity.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3">Integrity</h4>
              <p className="text-gray-600">
                We uphold integrity in every interaction, fostering trust and
                ensuring genuine results for our clients.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-3">Efficiency</h4>
              <p className="text-gray-600">
                We leverage innovative technologies and streamlined processes to
                deliver construction projects with maximum efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
