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

    const getColor = (diff: number | undefined, regionName?: string) => {
      if (diff === undefined) return '#334155';
      
      // Normalizar diff entre 0 (más afín) y 1 (menos afín)
      const normalized = (diff - minDiff) / (maxDiff - minDiff);
      
      // Gradiente de verde oscuro (más afín) a verde claro (menos afín)
      // Verde oscuro: rgb(5, 150, 105) -> Verde claro: rgb(134, 239, 172)
      const r = Math.round(5 + (134 - 5) * normalized);
      const g = Math.round(150 + (239 - 150) * normalized);
      const b = Math.round(105 + (172 - 105) * normalized);
      
      return `rgb(${r}, ${g}, ${b})`;
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
        
        // Encontrar la posición de esta región en el ranking
        const sortedScores = [...scores].sort((a, b) => a.diff - b.diff);
        const position = sortedScores.findIndex(s => s.region === profileName) + 1;
        const isTopOne = position === 1;

        return {
          fillColor: getColor(diff, profileName),
          weight: isTopOne ? 3 : 1,
          opacity: 1,
          color: isTopOne ? '#e2ee34ff' : 'white', // Borde verde para la #1
          dashArray: isTopOne ? '' : '3',
          fillOpacity: isTopOne ? 0.95 : 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const geoName = feature.properties.name;
        const profileName = GEOJSON_TO_PROFILE_NAME[geoName];
        const diff = profileName ? scoreMap[profileName] : undefined;
        
        if (profileName && diff !== undefined) {
          // Encontrar la posición de esta región en el ranking
          const sortedScores = [...scores].sort((a, b) => a.diff - b.diff);
          const position = sortedScores.findIndex(s => s.region === profileName) + 1;
          const totalRegions = sortedScores.length;
          
          // Calcular grado de afinidad (1 es máxima, 19 es mínima)
          const affinityScore = Math.round(1 + ((position - 1) / (totalRegions - 1)) * 18) || 1;
          
          const affinityLabel = `#${position} - Afinidad: ${affinityScore}/19`;
            
          layer.bindTooltip(`${profileName}<br/>${affinityLabel}`, {
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
