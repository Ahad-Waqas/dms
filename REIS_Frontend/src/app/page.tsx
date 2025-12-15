"use client"
import { useEffect } from "react";

import initPlanet3D from "@/components/3D/planet"
import Snowfall from 'react-snowfall'

export default function Home() {

  useEffect(() => {
    const {scene, renderer} = initPlanet3D()
    
    return () => {
      if (renderer) {
        const gl = renderer.getContext();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        renderer.dispose()
      }
    }
  }, [])

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  }
  
  return (
    <div className="page">
      <Snowfall 
        color="white"
        snowflakeCount={1000}
        />
      
      <section className="hero_main">
        <div className="content">
          <h1 className="heading">REIS</h1>

          <p className="paragraph">
            Real-time monitoring and interactive maps for earthquakes, floods, and wildfires.
          </p>

          <button className="cta_btn" onClick={goToDashboard}>Explore REIS Dashboard</button>
        </div>
        <canvas className="planet-3D" />
      </section>
    </div>
  );
}
