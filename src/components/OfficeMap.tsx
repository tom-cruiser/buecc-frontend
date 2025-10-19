// components/OfficeMap.tsx
import React from "react"; // Make sure React is imported for JSX
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react"; // Import MapPin icon
import { renderToStaticMarkup } from "react-dom/server"; // Import renderToStaticMarkup

// Create a custom Leaflet icon using L.divIcon
const createCustomMapPinIcon = () => {
  // Render the Lucide MapPin icon as a static HTML string
  const iconHtml = renderToStaticMarkup(
    <MapPin
      size={32} // Adjust size as needed
      color="#1e40af" // A strong blue color, matching blue-600
      strokeWidth={2}
      // You can add more styling here, e.g., a background circle
      style={{
        backgroundColor: "white",
        borderRadius: "50%",
        padding: "4px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-map-pin-icon", // Add a custom class for potential further CSS
    iconSize: [40, 40], // Adjust based on your icon's rendered size (width, height)
    iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location (center-bottom)
    popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
  });
};

const OfficeMap = () => {
  // BUECC office coordinates (example - use real coordinates)
  const officeLocation = {
    lat: -3.3760456,
    lng: 29.3872297,
    address: "Avenue Sanzu no 2,Boulevard Mwezi Gisabo, Bujumbura",
  };

  // Create the icon instance once
  const customIcon = createCustomMapPinIcon();

  return (
    <MapContainer
      center={[officeLocation.lat, officeLocation.lng]}
      zoom={17}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker
        position={[officeLocation.lat, officeLocation.lng]}
        icon={customIcon}
      >
        <Popup>
          <div className="font-semibold">BUECC Headquarters</div>
          <div>{officeLocation.address}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default OfficeMap;
