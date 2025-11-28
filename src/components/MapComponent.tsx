'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import geoData from '@/data/spain-communities.json';
import geojsonMapping from '@/data/geojson-region-mapping.json';

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
  scores: { region: string; regionId: string; displayName: string; diff: number }[];
  maxDistance?: number; // Distancia máxima dinámica para calcular afinidades
}

// Usar mapeo importado desde JSON externo
const GEOJSON_TO_REGION_ID: Record<string, string> = geojsonMapping;

const MapComponent: React.FC<MapComponentProps> = ({ scores, maxDistance = 45 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already exists
    if (mapInstanceRef.current) {
      return;
    }

    const scoreMap: Record<string, number> = {};
    const displayNameMap: Record<string, string> = {};
    scores.forEach(s => {
      scoreMap[s.regionId] = s.diff;
      displayNameMap[s.regionId] = s.displayName;
    });

    // Calculate min and max diff
    let minDiff = 0, maxDiff = 1;
    if (scores.length > 0) {
      minDiff = Math.min(...scores.map(s => s.diff));
      maxDiff = Math.max(...scores.map(s => s.diff));
    }

    const getColor = (diff: number | undefined) => {
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

    const map = L.map(mapContainerRef.current, {
      center: [35.85, -10.85],
      zoom: 4,
      minZoom: 4,
      maxZoom: 8,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      zoomControl: true,
      attributionControl: true,
      zoomAnimation: true
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
        const regionId = GEOJSON_TO_REGION_ID[geoName];
        const diff = regionId ? scoreMap[regionId] : undefined;
        
        // Encontrar la posición de esta región en el ranking
        const sortedScores = [...scores].sort((a, b) => a.diff - b.diff);
        const position = sortedScores.findIndex(s => s.regionId === regionId) + 1;
        const isTopOne = position === 1;

        return {
          fillColor: getColor(diff),
          weight: isTopOne ? 3 : 1,
          opacity: 1,
          color: isTopOne ? '#e2ee34ff' : 'white', // Borde verde para la #1
          dashArray: isTopOne ? '' : '3',
          fillOpacity: isTopOne ? 0.95 : 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const geoName = feature.properties.name;
        const regionId = GEOJSON_TO_REGION_ID[geoName];
        const diff = regionId ? scoreMap[regionId] : undefined;
        const displayName = regionId ? displayNameMap[regionId] : geoName;
        
        if (regionId && diff !== undefined) {
          const sortedScores = [...scores].sort((a, b) => a.diff - b.diff);
          const position = sortedScores.findIndex(s => s.regionId === regionId) + 1;
          const totalRegions = sortedScores.length;
          
          const emoji = position === 1 ? '🏆' : position <= 3 ? '⭐' : position <= 5 ? '✨' : '📍';

          const tooltipContent = `
            <div style="font-size: 13px; line-height: 1.6;">
              <strong style="font-size: 14px;">${emoji} ${displayName}</strong><br/>
              <span style="color: #10b981;">Ranking: #${position}/${totalRegions}</span>
            </div>
          `;
            
          layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: 'top',
            className: 'custom-tooltip',
            opacity: 0.95
          });

          layer.on({
            mouseover: (e) => {
              const hoveredLayer = e.target;
              hoveredLayer.setStyle({
                weight: 3,
                color: '#ec4899',
                fillOpacity: 0.9
              });
            },
            mouseout: (e) => {
              const hoveredLayer = e.target;
              const isTopOne = position === 1;
              hoveredLayer.setStyle({
                weight: isTopOne ? 3 : 1,
                color: isTopOne ? '#16a34a' : 'white',
                fillOpacity: isTopOne ? 0.95 : 0.7
              });
            }
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
