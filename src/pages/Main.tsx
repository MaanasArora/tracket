import logo from "../assets/logo.webp";
import { useEffect, useState } from "react";
import { getLocations } from "../api/base";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";

const Appbar = () => (
  <div className="bg-dark p-2">
    <img src={logo} alt="logo" className="h-7" />
  </div>
);

const ChangeView = ({ markers }: any) => {
  const map = useMap();

  const bounds = markers.reduce(
    (acc, location) => {
      if (isNaN(location.latitude) || isNaN(location.longitude)) {
        return acc;
      }

      return {
        north: Math.max(acc.north, location.latitude),
        east: Math.max(acc.east, location.longitude),
        south: Math.min(acc.south, location.latitude),
        west: Math.min(acc.west, location.longitude),
      };
    },
    {
      north: -Infinity,
      east: -Infinity,
      south: Infinity,
      west: Infinity,
    }
  );

  console.log(bounds);

  map.fitBounds(
    [
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    ],
    { padding: [50, 50] }
  );

  return null;
};

const Main = () => {
  const [locations, setLocations] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    getLocations().then((data) => {
      setLocations(data);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Appbar />
      {locations.length > 0 && (
        <div className="grow">
          <MapContainer className="h-full">
            <ChangeView markers={locations} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location: any) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                eventHandlers={{
                  click: () => {
                    navigate(`/location/${location.id}`);
                  },
                }}
              />
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default Main;
