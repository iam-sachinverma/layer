"use client";

import React, { useState } from "react";

import styles from "./page.module.css";
import Map from "./components/map/map";
import Sidebar from "./components/sidebar/sidebar";

export default function Home() {
  const [map, setMap] = useState(null);
  const MemoizedSidebar = React.memo(Sidebar);

  return (
    <main>
      <Map returnRef={setMap} />
      <div className={styles.tabs_container}>
        {map && <MemoizedSidebar map={map} />}
      </div>
      <div className={styles.footer}>
        <a target="_blank" href="https://www.linkedin.com/in/sachin-verma-/">
          © 2024 Sachin Verma
        </a>
      </div>
    </main>
  );
}
