'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import geoData from '@/data/spain-communities.json';

// Fix for Leaflet default icon issue in Next.js
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface MapComponentProps {
  scores: { region: string; diff: number }[];
  maxDistance?: number; // Distancia máxima dinámica para calcular afinidades
}

const GEOJSON_TO_PROFILE_NAME: Record<string, string> = {
  "Andalucia": "Andalucía",
  "Aragon": "Aragón",
  "Asturias": "Principado de Asturias",
  "Baleares": "Islas Baleares",
  "Canarias": "Canarias",
  "Cantabria": "Cantabria",
  "Castilla-La Mancha": "Castilla-La Mancha",
  "Castilla-Leon": "Castilla y León",
  "Cataluña": "Cataluña",
  "Ceuta": "Ceuta",
  "Extremadura": "Extremadura",
  "Galicia": "Galicia",
  "La Rioja": "La Rioja",
  "Madrid": "Comunidad de Madrid",
  "Melilla": "Melilla",
  "Murcia": "Región de Murcia",
  "Navarra": "Comunidad Foral de Navarra",
  "Pais Vasco": "País Vasco",
  "Valencia": "Comunidad Valenciana"
};

const MapComponent: React.FC<MapComponentProps> = ({ scores, maxDistance = 45 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already exists
    if (mapInstanceRef.current) {
      return;
    }

    // Create score map
    const scoreMap: Record<string, number> = {};
    scores.forEach(s => {
      scoreMap[s.region] = s.diff;
    });

    // Calculate min and max diff
    let minDiff = 0, maxDiff = 1;
    if (scores.length > 0) {
      minDiff = Math.min(...scores.map(s => s.diff));
      maxDiff = Math.max(...scores.map(s => s.diff));
    }

    const getColor = (diff: number | undefined) => {
      if (diff === undefined) return '#334155';
      
      // Fórmula exponencial para mayor diferenciación visual: 95% para diff=0, 30% para maxDistance
      const normalizedDiff = diff / maxDistance; // 0 a 1
      const matchPercentage = Math.max(30, Math.min(100, 95 - (normalizedDiff * normalizedDiff * 65)));
      
      // Convert to intensity (0-1, where 1 is best match)
      // Normalizar de 30-95% a 0-1
      const intensity = (matchPercentage - 30) / 65;
      
      // Enhanced gradient for better visual differentiation
      // Using HSL: Hue 330 (pink/magenta)
      // Higher match = more saturated and much darker for better contrast
      const saturation = 50 + (intensity * 45); // 50-95%
      const lightness = 75 - (intensity * 65); // 75% (very light) to 10% (very dark)
      
      return `hsl(330, ${saturation}%, ${lightness}%)`;
    };

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [35.85, -10.85],
      zoom: 4,
      scrollWheelZoom: true,
      attributionControl: true
    });

    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // Add GeoJSON
    L.geoJSON(geoData as any, {
      style: (feature) => {
        const geoName = feature?.properties?.name;
        const profileName = GEOJSON_TO_PROFILE_NAME[geoName];
        const diff = profileName ? scoreMap[profileName] : undefined;

        return {
          fillColor: getColor(diff),
          weight: 1,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const geoName = feature.properties.name;
        const profileName = GEOJSON_TO_PROFILE_NAME[geoName];
        const diff = profileName ? scoreMap[profileName] : undefined;
        
        if (profileName && diff !== undefined) {
          // Fórmula exponencial consistente con getColor
          const normalizedDiff = diff / maxDistance;
          const matchPercentage = Math.max(30, Math.min(100, 95 - (normalizedDiff * normalizedDiff * 65))).toFixed(1);
          layer.bindTooltip(`${profileName}: ${matchPercentage}% Match`, {
            sticky: true,
            direction: 'top'
          });
        } else {
          layer.bindTooltip(geoName, { sticky: true });
        }
      }
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [scores, maxDistance]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapComponent;
