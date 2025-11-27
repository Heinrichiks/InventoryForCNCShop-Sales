import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SableLuzMaceWindu = ({ width = 100, height = 100 }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    // --- Scene / Camera / Renderer ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Lights ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    // Luz morada que ilumina el sable
    const purpleLight = new THREE.PointLight(0x9933ff, 0, 3);
    purpleLight.position.set(0, 0.5, 0);
    scene.add(purpleLight);

    // --- Grupo principal del sable ---
    const sabreGroup = new THREE.Group();
    scene.add(sabreGroup);

    // 🎯 EMPUÑADURA (mango del sable)
    const handleGroup = new THREE.Group();
    sabreGroup.add(handleGroup);

    // Cuerpo principal del mango (cilindro metálico)
    const handleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.5, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.3,
    });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.y = -0.6;
    handleGroup.add(handleMesh);

    // Grip (empuñadura con textura)
    const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 16);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.4,
      roughness: 0.8,
    });
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    gripMesh.position.y = -0.6;
    handleGroup.add(gripMesh);

    // Anillos decorativos (3 anillos)
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.042, 0.005, 8, 16);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.2,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -0.6 + (i - 1) * 0.12;
      ring.rotation.x = Math.PI / 2;
      handleGroup.add(ring);
    }

    // Emisor (parte superior del mango de donde sale la hoja)
    const emitterGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16);
    const emitterMat = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.y = -0.31;
    handleGroup.add(emitter);

    // 🟣 HOJA DEL SABLE (blade)
    const bladeGroup = new THREE.Group();
    bladeGroup.position.y = -0.27;
    sabreGroup.add(bladeGroup);

    // Hoja principal (cilindro largo y delgado)
    const bladeGeo = new THREE.CylinderGeometry(0.02, 0.015, 1.2, 16);
    const bladeMat = new THREE.MeshBasicMaterial({
      color: 0x9933ff, // Morado característico de Mace Windu
      transparent: true,
      opacity: 0,
    });
    const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    bladeMesh.position.y = 0.6; // Centro de la hoja
    bladeGroup.add(bladeMesh);

    // Núcleo interno brillante (más blanco)
    const coreGeo = new THREE.CylinderGeometry(0.012, 0.008, 1.2, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xeeccff,
      transparent: true,
      opacity: 0,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.6;
    bladeGroup.add(coreMesh);

    // 🌟 HALO DE LA HOJA (glow effect)
    const createBladeHalo = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 256, 256);

      // Gradiente vertical para el glow
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "rgba(153, 51, 255, 0.8)");
      grad.addColorStop(0.3, "rgba(153, 51, 255, 0.5)");
      grad.addColorStop(0.7, "rgba(153, 51, 255, 0.3)");
      grad.addColorStop(1, "rgba(153, 51, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;

      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0,
      });

      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.15, 1.4, 1);
      sprite.position.y = 0.6;
      return sprite;
    };

    const halo = createBladeHalo();
    bladeGroup.add(halo);

    // 💫 PARTÍCULAS DE ENERGÍA (pequeñas chispas)
    const particles = [];
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: 0xcc99ff,
        transparent: true,
        opacity: 0,
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      particle.position.y = 0.2 + Math.random() * 1.0;
      particle.position.x = (Math.random() - 0.5) * 0.04;
      particle.position.z = (Math.random() - 0.5) * 0.04;
      bladeGroup.add(particle);
      particles.push({
        mesh: particle,
        baseY: particle.position.y,
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Rotar el sable para que apunte hacia arriba-derecha
    sabreGroup.rotation.z = -Math.PI / 6; // -30 grados

    // 🎯 VARIABLES DE ANIMACIÓN
    let sabreState = 0; // 0: apagado, 1: encendiendo, 2: encendido, 3: apagando
    let sabreTime = 0;
    const IGNITE_TIME = 0.8;   // Tiempo de encendido
    const ON_TIME = 3.0;       // Tiempo encendido
    const EXTINGUISH_TIME = 0.6; // Tiempo de apagado
    const OFF_TIME = 2.5;      // Tiempo apagado

    // --- Animation loop ---
    let rafId;
    let t = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      t += 0.016; // ~60fps
      sabreTime += 0.016;

      // Rotación sutil del sable
      sabreGroup.rotation.y = Math.sin(t * 0.3) * 0.15;

      // 🎯 MÁQUINA DE ESTADOS DEL SABLE
      switch (sabreState) {
        case 0: // APAGADO
          if (sabreTime > OFF_TIME) {
            sabreState = 1;
            sabreTime = 0;
          }
          // Todo apagado
          bladeMesh.material.opacity = 0;
          coreMesh.material.opacity = 0;
          halo.material.opacity = 0;
          purpleLight.intensity = 0;
          bladeGroup.scale.y = 0.01;
          particles.forEach((p) => (p.mesh.material.opacity = 0));
          break;

        case 1: // ENCENDIENDO
          {
            const igniteProgress = Math.min(sabreTime / IGNITE_TIME, 1);
            const easeOut = 1 - Math.pow(1 - igniteProgress, 3); // Easing suave

            // La hoja crece desde la base
            bladeGroup.scale.y = easeOut;

            // Opacidad de la hoja
            bladeMesh.material.opacity = igniteProgress * 0.9;
            coreMesh.material.opacity = igniteProgress * 1.0;

            // Halo crece y se intensifica
            halo.material.opacity = igniteProgress * 0.7;

            // Luz morada se enciende
            purpleLight.intensity = igniteProgress * 1.5;

            // Partículas aparecen
            particles.forEach((p, idx) => {
              const particleDelay = (idx / particleCount) * 0.3;
              const particleProgress = Math.max(
                0,
                Math.min(1, (igniteProgress - particleDelay) / 0.7)
              );
              p.mesh.material.opacity = particleProgress * 0.6;
            });

            // Sonido característico del encendido (simulado con vibración visual)
            const igniteVibration = Math.sin(igniteProgress * 40) * 0.01 * (1 - igniteProgress);
            bladeGroup.position.x = igniteVibration;

            if (igniteProgress >= 1) {
              sabreState = 2;
              sabreTime = 0;
            }
          }
          break;

        case 2: // ENCENDIDO (activo)
          {
            if (sabreTime > ON_TIME) {
              sabreState = 3;
              sabreTime = 0;
            }

            // Hoja completamente extendida
            bladeGroup.scale.y = 1;

            // Pulso sutil de la hoja
            const pulse = Math.sin(t * 2) * 0.05 + 0.95;
            bladeMesh.material.opacity = 0.85 * pulse;
            coreMesh.material.opacity = 1.0;

            // Halo pulsante
            halo.material.opacity = 0.6 + Math.sin(t * 1.5) * 0.1;

            // Luz morada constante con ligero parpadeo
            purpleLight.intensity = 1.3 + Math.sin(t * 3) * 0.2;

            // Partículas flotantes
            particles.forEach((p) => {
              // Movimiento vertical ondulatorio
              const wave = Math.sin(t * p.speed + p.phase) * 0.03;
              p.mesh.position.y = p.baseY + wave;

              // Parpadeo aleatorio
              const flicker = 0.4 + Math.sin(t * 5 + p.phase) * 0.2;
              p.mesh.material.opacity = flicker;

              // Rotación sutil
              p.mesh.rotation.y += 0.02;
            });

            // Vibración ultrasutil del sable (zumbido)
            const hum = Math.sin(t * 30) * 0.001;
            bladeGroup.position.x = hum;
          }
          break;

        case 3: // APAGANDO
          {
            const extinguishProgress = Math.min(
              sabreTime / EXTINGUISH_TIME,
              1
            );
            const fadeOut = 1 - extinguishProgress;
            const easeIn = Math.pow(fadeOut, 2); // Easing rápido al final

            // La hoja se retrae hacia la base
            bladeGroup.scale.y = easeIn;

            // Opacidad disminuye
            bladeMesh.material.opacity = fadeOut * 0.85;
            coreMesh.material.opacity = fadeOut;

            // Halo se desvanece
            halo.material.opacity = fadeOut * 0.6;

            // Luz morada se apaga
            purpleLight.intensity = fadeOut * 1.3;

            // Partículas desaparecen
            particles.forEach((p) => {
              p.mesh.material.opacity = fadeOut * 0.6;
            });

            // Sonido de apagado (vibración inversa)
            const extinguishVibration =
              Math.sin((1 - extinguishProgress) * 30) * 0.008 * extinguishProgress;
            bladeGroup.position.x = extinguishVibration;

            if (extinguishProgress >= 1) {
              sabreState = 0;
              sabreTime = 0;
            }
          }
          break;
      }

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
        if (container.contains(renderer.domElement))
          container.removeChild(renderer.domElement);
      } catch (e) {}

      // Cleanup
      particles.forEach((p) => {
        try {
          p.mesh.geometry.dispose();
        } catch {}
        try {
          p.mesh.material.dispose();
        } catch {}
      });

      try {
        handleGeo.dispose();
      } catch {}
      try {
        handleMat.dispose();
      } catch {}
      try {
        gripGeo.dispose();
      } catch {}
      try {
        gripMat.dispose();
      } catch {}
      try {
        emitterGeo.dispose();
      } catch {}
      try {
        emitterMat.dispose();
      } catch {}
      try {
        bladeGeo.dispose();
      } catch {}
      try {
        bladeMat.dispose();
      } catch {}
      try {
        coreGeo.dispose();
      } catch {}
      try {
        coreMat.dispose();
      } catch {}
      try {
        renderer.dispose();
      } catch {}
    };
  }, [width, height]);

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
      }}
    />
  );
};

export default SableLuzMaceWindu;