"use client";

import React, { useState } from "react";

import styles from "./page.module.css";
import Map from "./components/map/map";
import Sidebar from "./components/sidebar/sidebar";

/**
 * Home Component
 *
 * This component represents the main page of the application.
 * It renders a map component and a sidebar component.
 *
 * Props:
 *   None
 *
 * State:
 *   - map: A reference to the map component obtained through useState hook.
 *
 * @return {JSX.Element} The rendered Home component
 */
export default function Home() {
  // Initialize state variable 'map' using useState hook, initially set to null
  const [map, setMap] = useState(null);
  // Memoize the Sidebar component using React.memo
  const MemoizedSidebar = React.memo(Sidebar);

  return (
    <main>
      {/* Render the Map component and pass a function to update 'map' reference */}
      <Map returnRef={setMap} />

      {/* Render the sidebar only if 'map' is available */}
      <div className={styles.tabs_container}>
        {map && <MemoizedSidebar map={map} />}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <a target="_blank" href="https://www.linkedin.com/in/sachin-verma-/">
          © 2024 Sachin Verma
        </a>
      </div>
    </main>
  );
}
