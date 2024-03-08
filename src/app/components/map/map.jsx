"use client";

import { useEffect, useState, useRef } from "react";
import { fromLonLat } from "ol/proj";
import {
  FullScreen,
  ZoomSlider,
  defaults as defaultControls,
} from "ol/control";
import { OSM } from "ol/source";
import { Tile as TileLayer } from "ol/layer";
import OlMap from "ol/Map";
import View from "ol/View.js";
import "ol/ol.css";
import "./map.css";

const Map = ({ returnRef }) => {
  // State and ref initialization
  const [map, setMap] = useState(null);
  const mapElement = useRef();

  // Creating a raster layer
  const raster = new TileLayer({
    source: new OSM(),
  });

  useEffect(() => {
    // Initialize the map when it is not yet created
    if (!map) {
      const mapTemp = new OlMap({
        layers: [raster],
        target: mapElement.current,
        controls: defaultControls().extend([
          new FullScreen(),
          new ZoomSlider(),
        ]),
        view: new View({
          center: fromLonLat([78.9629, 20.5937]),
          zoom: 6,
          maxTilesLoading: 8,
        }),
      });

      // Update map size asynchronously to ensure correct rendering
      setTimeout(() => {
        mapTemp.updateSize();
      }, 0);

      // Set the map state and return the map reference if callback is provided
      setMap(mapTemp);
      if (typeof returnRef === "function") returnRef(mapTemp);

      // Clean up the map instance when the component is unmounted
      return () => {
        mapTemp.setTarget(null); // Remove the map target from the DOM
      };
    }
  }, []);

  return (
    <div ref={mapElement} className="map">
      <div id="popup-container">
        <div id="popup-content">
          <div id="popup-text"></div>
        </div>
      </div>

      <div id="tooltip-container">
        <div id="tooltip-content"></div>
      </div>
    </div>
  );
};

export default Map;
