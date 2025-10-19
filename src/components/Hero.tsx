import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200)'
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Home in
            <span className="block text-yellow-400">Bujumbura</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover premium properties and professional construction services from Burundi's trusted real estate experts
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Location Input */}
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                  <MapPin className="text-gray-400 mr-3" size={20} />
                  <input
                    type="text"
                    placeholder="Enter neighborhood or address"
                    className="bg-transparent text-gray-800 placeholder-gray-500 w-full focus:outline-none"
                  />
                </div>

                {/* Property Type */}
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                  <Filter className="text-gray-400 mr-3" size={20} />
                  <select className="bg-transparent text-gray-800 w-full focus:outline-none">
                    <option>Property Type</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Land</option>
                    <option>Commercial</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-gray-400 mr-3">$</span>
                  <select className="bg-transparent text-gray-800 w-full focus:outline-none">
                    <option>Price Range</option>
                    <option>Under $200K</option>
                    <option>$200K - $500K</option>
                    <option>$500K - $1M</option>
                    <option>Over $1M</option>
                  </select>
                </div>

                {/* Search Button */}
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center transition-colors duration-200">
                  <Search className="mr-2" size={20} />
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-200">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">200+</div>
              <div className="text-gray-200">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-200">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">15+</div>
              <div className="text-gray-200">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;