// The map itself.
//
// NOTE ON LIBRARY CHOICE: the brief specifies `react-google-maps` (with
// withScriptjs/withGoogleMap/GoogleMap/Marker). That package was tested directly and
// crashes immediately on React 19 with "React.createFactory is not a function" —
// React.createFactory was removed in React 19 and react-google-maps's internals still
// call it. `npm install react-google-maps` itself fails on a fresh Vite project too,
// since its peer dependency only allows React 15/16.
//
// This uses `@react-google-maps/api` instead — the actively maintained successor from
// the same maintainer, built specifically to replace react-google-maps. Same underlying
// concepts (GoogleMap, Marker), modern implementation, explicit React 19 support.

import { useCallback, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

// Tel Aviv, as given in the assignment. Swap for any lat/lng you want.
const center = {
  lat: 32.0853,
  lng: 34.7818,
};

function Map() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) {
    return (
      <div className="alert alert-danger" role="alert">
        Failed to load Google Maps: {loadError.message}. Check that
        VITE_GOOGLE_MAPS_API_KEY is set and the Maps JavaScript API is enabled for that key
        (see README).
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="alert alert-warning" role="alert">
        No API key found. Add VITE_GOOGLE_MAPS_API_KEY to a .env file — see README for setup.
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : (
    <div style={containerStyle} className="d-flex align-items-center justify-content-center">
      Loading map...
    </div>
  );
}

export default Map;
