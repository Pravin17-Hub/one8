import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDHeroVisualizer() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & WebGL Renderer setup
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Create the 3D Object Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Geometry base: Icosahedron
    const sphereGeom = new THREE.IcosahedronGeometry(1.6, 2);
    
    // Particle Sphere (Outer shell)
    const particleMat = new THREE.PointsMaterial({
      color: 0x3b82f6, // primary blue/cyan
      size: 0.045,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particleSphere = new THREE.Points(sphereGeom, particleMat);
    mainGroup.add(particleSphere);

    // Wireframe geometry (Inner shell)
    const wireGeom = new THREE.IcosahedronGeometry(1.5, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // amber gold
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    mainGroup.add(wireMesh);

    // 3. Add directional lighting for depth
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // 4. Mouse movement interaction handler
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Normalize values between -1 and 1
      mouseX = (x / rect.width) * 2 - 1;
      mouseY = -(y / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 5. Animation loop
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation
      particleSphere.rotation.y += 0.0015;
      particleSphere.rotation.x += 0.0006;
      wireMesh.rotation.y -= 0.0025;
      wireMesh.rotation.z += 0.001;

      // Cursor parallax rotation (smooth interpolation)
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.8;

      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.08;
      mainGroup.rotation.x += (targetY - mainGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle viewport resizing
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 7. Cleanup resource consumption
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose webgl objects
      sphereGeom.dispose();
      particleMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
    />
  );
}
