import React, { useEffect, useRef } from "react";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import Draw from "ol/interaction/Draw.js";
import { LineString, Polygon } from "ol/geom.js";
import { getArea, getLength } from "ol/sphere.js";
import Overlay from "ol/Overlay.js";
import { unByKey } from "ol/Observable.js";
import "./sidebar.css";

/**
 * Sidebar Component
 *
 * This component provides functionality for interacting with the map by drawing shapes
 * and measuring distances.
 *
 * Props:
 *   - map: Reference to the OpenLayers map instance.
 *
 * State:
 *   None
 *
 * @param {Object} props - Props for the Sidebar component.
 * @param {Object} props.map - Reference to the OpenLayers map instance.
 * @returns {JSX.Element} The rendered Sidebar component.
 */
const Sidebar = ({ map }) => {
  // Refs for DOM elements and interactions
  const typeSelectRef = useRef(null);
  const drawRef = useRef(null);
  const measureTooltipElementRef = useRef(null);
  const helpTooltipElementRef = useRef(null);
  let measureTooltip;
  let helpTooltip;
  let sketch;

  useEffect(() => {
    // Creating a source for vector layer
    const source = new VectorSource({ wrapX: false });

    // Creating a vector layer
    const vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.5)",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
        }),
      }),
    });

    // Add Vector layer to map
    map.addLayer(vector);

    const typeSelect = typeSelectRef.current;

    // Function to add interaction based on selected shape
    const addInteraction = () => {
      let value = typeSelect.value;
      if (value !== "None") {
        drawRef.current = new Draw({
          source: source,
          type: value,
          style: new Style({
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.5)",
              lineDash: [10, 10],
              width: 2,
            }),
            image: new CircleStyle({
              radius: 5,
              stroke: new Stroke({
                color: "rgba(0, 0, 0, 0.7)",
              }),
              fill: new Fill({
                color: "rgba(255, 255, 255, 0.2)",
              }),
            }),
          }),
        });
        map.addInteraction(drawRef.current);

        createMeasureTooltip();
        createHelpTooltip();

        let listener;
        drawRef.current.on("drawstart", function (evt) {
          sketch = evt.feature;

          let tooltipCoord = evt.coordinate;

          listener = sketch.getGeometry().on("change", function (evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof Polygon) {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              output = formatLength(geom);
              tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElementRef.current.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
          });
        });

        drawRef.current.on("drawend", function () {
          measureTooltipElementRef.current.className =
            "ol-tooltip ol-tooltip-static";
          measureTooltip.setOffset([0, -7]);
          sketch = null;
          measureTooltipElementRef.current = null;
          createMeasureTooltip();
          unByKey(listener);
        });
      }
    };

    // Event listener to handle shape selection change
    const handleChange = () => {
      map.removeInteraction(drawRef.current);
      addInteraction();
    };

    // Initialize event listener
    typeSelect.addEventListener("change", handleChange);

    // Cleanup function to remove interactions and event listeners
    return () => {
      map.removeInteraction(drawRef.current);

      // Clean up event listeners if any
      typeSelect.removeEventListener("change", handleChange);

      // Remove layers or any other cleanup
      map.removeLayer(vector);
    };
  }, [map]);

  // Functions to format length and area measurements
  const formatLength = (line) => {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + " " + "km";
    } else {
      output = Math.round(length * 100) / 100 + " " + "m";
    }
    return output;
  };

  const formatArea = (polygon) => {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output =
        Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
    } else {
      output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
    }
    return output;
  };

  // Functions to create help and measure tooltips
  const createHelpTooltip = () => {
    // Create the tooltip element
    const helpTooltipElement = document.createElement("div");
    helpTooltipElement.className = "ol-tooltip hidden";
    helpTooltip = new Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: "center-left",
    });
    map.addOverlay(helpTooltip);
    helpTooltipElementRef.current = helpTooltipElement;
  };

  const createMeasureTooltip = () => {
    // Create the tooltip element
    const measureTooltipElement = document.createElement("div");
    measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    map.addOverlay(measureTooltip);
    measureTooltipElementRef.current = measureTooltipElement;
  };

  return (
    <div className="sidebar">
      <div className="select">
        <label htmlFor="selectShape">
          Draw polygon, pin-point and line on the map:
        </label>
        <select className="select-shape" id="selectShape" ref={typeSelectRef}>
          <option value="None">None</option>
          <option value="Point">Pin Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;
