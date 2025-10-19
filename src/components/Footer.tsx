import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <span className="font-bold text-lg">BUECC</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Burundi Engineering</h3>
                <p className="text-sm text-gray-400">
                  Construction & Real Estate
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Building Burundi's future through innovative construction
              solutions and premium real estate services since 2009.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="home"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="properties"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Properties
                </a>
              </li>
              <li>
                <a
                  href="construction"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Construction
                </a>
              </li>
              <li>
                <a
                  href="about"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">Property Sales</span>
              </li>
              <li>
                <span className="text-gray-400">Property Rentals</span>
              </li>
              <li>
                <span className="text-gray-400">Construction Management</span>
              </li>
              <li>
                <span className="text-gray-400">Architectural Design</span>
              </li>
              <li>
                <span className="text-gray-400">Civil Engineering</span>
              </li>
              <li>
                <span className="text-gray-400">Project Consultation</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone size={16} className="mr-3 text-blue-400" />
                <div>
                  <p className="text-gray-400">+257 61 04 81 09</p>
                  <p className="text-gray-400">+257 79 98 09 85</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail size={16} className="mr-3 text-blue-400" />
                <div>
                  <p className="text-gray-400">bueccompany@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin size={16} className="mr-3 text-blue-400 mt-1" />
                <div>
                  <p className="text-gray-400">123 Independence Avenue</p>
                  <p className="text-gray-400">Centre Ville, Bujumbura</p>
                  <p className="text-gray-400">Burundi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest properties and
              construction insights
            </p>
            {/* Substack Newsletter Embed */}
            <div className="flex justify-center">
              <iframe
                src="https://buecc.substack.com/embed"
                width="380" // Slightly reduced width
                height="100" // Significantly reduced height to cut off extra text
                style={{
                  border: "none", // Removed the border
                  background: "transparent", // Ensured background is transparent
                }}
                frameBorder="0"
                scrolling="no"
                className="max-w-full h-auto" // Added responsive classes
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 BUECC - Burundi Engineering, Construction & Consulting. All
            rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
