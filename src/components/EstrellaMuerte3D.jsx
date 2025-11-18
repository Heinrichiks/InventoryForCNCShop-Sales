import React, { useEffect, useRef } from "react";
import * as THREE from "three";


const EstrellaMuerte3D = ({ width = 100, height = 100 }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
  const container = containerRef.current;
  if (!container || sceneRef.current) return;

  // --- Scene / Camera / Renderer ---
  const scene = new THREE.Scene();
  sceneRef.current = scene;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(2.5, 0.6, 2.6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

    // --- Lights (más sutiles) ---
  // Ambient muy suave para evitar contrastes fuertes
  const ambient = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambient);

  // HemisphereLight para iluminación muy suave (cielo/tierra)
  const hemi = new THREE.HemisphereLight(0xfff8e5, 0x404050, 0.18);
  scene.add(hemi);

  // Key light tenue para definir volumen sin quemar
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
  keyLight.position.set(4, 6, 3);
  keyLight.castShadow = false;
  scene.add(keyLight);

  // Rim suave para separar la silueta del fondo
  const rim = new THREE.DirectionalLight(0xffffff, 0.12);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  // Fill sutil para balance de color
  const fill = new THREE.DirectionalLight(0x88aaff, 0.06);
  fill.position.set(-2, 1, 2);
  scene.add(fill);


  // --- Death Star group ---
  const group = new THREE.Group();
  scene.add(group);

  // Esfera principal - MÁS SIMPLE
  const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.6,
    roughness: 0.5,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  // Surco ecuatorial - línea sutil
  const grooveGeo = new THREE.TorusGeometry(1.01, 0.02, 8, 100);
  const grooveMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    metalness: 0.5, 
    roughness: 0.6 
  });
  const groove = new THREE.Mesh(grooveGeo, grooveMat);
  groove.rotation.x = Math.PI / 2;
  group.add(groove);

  // Líneas de latitud sutiles
  for (let i = 0; i < 3; i++) {
    const lat = (i - 1) * 0.5;
    const latR = Math.sqrt(1 - lat * lat);
    const latGeo = new THREE.TorusGeometry(latR, 0.008, 6, 64);
    const latMat = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      metalness: 0.4, 
      roughness: 0.6 
    });
    const latMesh = new THREE.Mesh(latGeo, latMat);
    latMesh.position.y = lat;
    latMesh.rotation.x = Math.PI / 2;
    group.add(latMesh);
  }

  // Plato del superlaser (sutil)
  const dishGeo = new THREE.SphereGeometry(0.3, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const dishMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    metalness: 0.5, 
    roughness: 0.4, 
    side: THREE.DoubleSide 
  });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.rotation.x = Math.PI;
  dish.position.set(0.8, 0.2, 0);
  group.add(dish);

  // 🔥 FOCO: NÚCLEO DEL LÁSER (punto brillante que pulsa)
  const laserCoreGeo = new THREE.CircleGeometry(0.15, 32);
  const laserCoreMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00, // Verde brillante
    transparent: true,
    opacity: 1
  });
  const laserCore = new THREE.Mesh(laserCoreGeo, laserCoreMat);
  laserCore.position.set(0.8, 0.2, 0.05);
  group.add(laserCore);

    // 🔥 HALO mejorado para evitar bordes oscuros
  const createHaloSprite = (color = 0x00ff00, size = 400) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 256);

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    // centro brillante, luego desvanecimiento a completamente transparente (evitar franja semitransparente)
    grad.addColorStop(0, `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 1)`);
    grad.addColorStop(0.12, `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.85)`);
    grad.addColorStop(0.28, `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.45)`);
    grad.addColorStop(0.6, `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, 0.12)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    // important: indicate premultiplied alpha and update the texture
    tex.premultiplyAlpha = true;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;

    const mat = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,      // evita que la sprite oculte/mezcle con la esfera de forma extraña
      transparent: true,
      alphaTest: 0.01,       // corta los píxeles casi totalmente transparentes para evitar halos oscuros
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size / 100, size / 100, 1);
    return sprite;
  };

  const halo = createHaloSprite(0x00ff00, 400);
  halo.position.copy(laserCore.position);
  halo.position.z += 0.08;
  group.add(halo);


  // 🔥 RAYOS LÁSER (múltiples líneas que se expanden)
  const laserBeams = [];
  const beamMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ff00, 
    transparent: true,
    opacity: 0.45,
    linewidth: 2
  });

  // Crear 12 rayos que irradian desde el centro
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const spread = 0.4; // Qué tan separados están los puntos finales
    
    const points = [];
    points.push(new THREE.Vector3(0.8, 0.2, 0.05)); // Origen (centro del láser)
    
    // Punto final del rayo (expandido)
    const endX = 0.8 + Math.cos(angle) * spread;
    const endY = 0.2 + Math.sin(angle) * spread;
    const endZ = -3; // Largo del rayo
    points.push(new THREE.Vector3(endX, endY, endZ));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, beamMaterial);
    group.add(line);
    laserBeams.push({ line, geometry, angle, offset: Math.random() * Math.PI * 2 });
  }

  // 🔥 RAYO PRINCIPAL (el más grueso)
  const mainBeamGeo = new THREE.CylinderGeometry(0.02, 0.08, 4, 8);
  const mainBeamMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00, 
    transparent: true,
    opacity: 0.5
  });
  const mainBeam = new THREE.Mesh(mainBeamGeo, mainBeamMat);
  mainBeam.position.set(0.8, 0.2, -2);
  mainBeam.rotation.x = Math.PI / 2;
  group.add(mainBeam);

  group.position.set(0, 0, 0);

  let camT = 0;

  // --- Animation loop ---
  let rafId;
  let t = 0;
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    t += 0.01;
    camT += 0.006;

    group.rotation.y += 0.005;
    group.rotation.x = Math.sin(t) * 0.003;

    // 🔥 PULSO DEL NÚCLEO (encendido sutil)
    const corePulse = 0.7 + 0.3 * Math.sin(t * 3);
    laserCore.material.opacity = corePulse;
    laserCore.scale.setScalar(1 + 0.2 * Math.sin(t * 4));

    // 🔥 PULSO DEL HALO (más dramático)
    const haloPulse = 1 + 0.25 * Math.abs(Math.sin(t * .5)); // menos amplitud
    halo.scale.set(2 * haloPulse, 2.2 * haloPulse, 1);
    halo.material.opacity = 0.5 + 0.25 * Math.sin(t * 2); // menos cambio de opacidad

    // 🔥 ANIMACIÓN DE LOS RAYOS (parpadeo y movimiento)
    laserBeams.forEach((beam, idx) => {
      const flicker = 0.3 + 0.7 * Math.abs(Math.sin(t * 5 + beam.offset));
      beam.line.material.opacity = flicker * 0.6;
      
      // Actualizar la longitud del rayo (efecto de disparo)
      const pulseFactor = 1 + 0.25 * Math.sin(t * 3 + beam.offset);
      const points = [];
      points.push(new THREE.Vector3(0.8, 0.2, 0.05));
      const spread = 0.4 * pulseFactor;
      const endX = 0.8 + Math.cos(beam.angle) * spread;
      const endY = 0.2 + Math.sin(beam.angle) * spread;
      points.push(new THREE.Vector3(endX, endY, -30 * pulseFactor));
      beam.geometry.setFromPoints(points);
    });

    // 🔥 RAYO PRINCIPAL pulsante
    const mainPulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.5));
    mainBeam.material.opacity = mainPulse * 0.7;
    mainBeam.scale.set(1 + 0.3 * Math.sin(t * 3), 1 + 0.2 * Math.sin(t * 4), 1);

    camera.position.x = 1.5 + Math.sin(camT) * 0.05;
    camera.position.y = 0.6 + Math.sin(camT * 0.7) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };

  animate();

  const onWindowResize = () => {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onWindowResize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onWindowResize);
    sceneRef.current = null;

    try {
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    } catch (e) {}

    laserBeams.forEach(beam => {
      try { beam.geometry.dispose(); } catch {}
    });

    try { sphereGeo.dispose(); } catch {}
    try { sphereMat.dispose(); } catch {}
    try { grooveGeo.dispose(); } catch {}
    try { grooveMat.dispose(); } catch {}
    try { dishGeo.dispose(); } catch {}
    try { dishMat.dispose(); } catch {}
    try { laserCoreGeo.dispose(); } catch {}
    try { laserCoreMat.dispose(); } catch {}
    try { beamMaterial.dispose(); } catch {}
    try { mainBeamGeo.dispose(); } catch {}
    try { mainBeamMat.dispose(); } catch {}
    try { renderer.dispose(); } catch {}
  };
}, [width, height]);

  // container style: fixed position in header but small so it doesn't disturb layout
  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: "8px",
        right: "220px",
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: "none",
        zIndex: 9999,
        filter: "none",
      }}
    />
  );
};

export default EstrellaMuerte3D;
