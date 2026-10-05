"use client";

import { useEffect, useRef } from "react";
import type * as THREE_NS from "three";
import { useInViewport, usePrefersReducedMotion } from "@/lib/hooks";
import styles from "./globe.module.css";

/**
 * Three.js low-poly globe — hero right side, desktop only.
 *
 * Brief: "Shows East African countries highlighted. Slow rotation, low poly
 * style. Color from design source. Opacity 0.3. Marker dots on Kenya, Uganda,
 * Tanzania, Rwanda, Ethiopia. Hidden on mobile. Pause out of viewport. DPR 1.5."
 *
 * Colour comes from the zip's info gradient (#2152ff -> #21d4fd) and dark
 * (#344767). No decorative shapes, no diamonds — wireframe icosahedron only.
 */

const MARKERS = [
  { name: "Kenya", lat: -1.2921, lng: 36.8219 },
  { name: "Uganda", lat: 0.3476, lng: 32.5825 },
  { name: "Tanzania", lat: -6.7924, lng: 39.2083 },
  { name: "Rwanda", lat: -1.9441, lng: 30.0619 },
  { name: "Ethiopia", lat: 9.145, lng: 40.4897 },
];

const RADIUS = 1.5;

function latLngToVec3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export default function Globe() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { ref: viewRef, inView } = useInViewport<HTMLDivElement>();
  const inViewRef = useRef(inView);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Hidden on mobile — never even initialise WebGL below 992px.
    if (window.matchMedia("(max-width: 992px)").matches) return;

    let disposed = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (disposed || !hostRef.current) return;

      const width = host.clientWidth || 560;
      const height = host.clientHeight || 560;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0.35, 4.6);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      // Brief: DPR 1.5 ceiling
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      host.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Low-poly wireframe sphere — icosahedron, detail 3.
      const sphereGeo = new THREE.IcosahedronGeometry(RADIUS, 3);
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(sphereGeo),
        new THREE.LineBasicMaterial({
          color: new THREE.Color("#2152ff"),
          transparent: true,
          opacity: 0.3, // brief: opacity 0.3
        })
      );
      group.add(wireframe);

      // Solid inner shell so markers on the far side are occluded.
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(RADIUS * 0.985, 3),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#344767"),
          transparent: true,
          opacity: 0.06,
        })
      );
      group.add(shell);

      // East African highlight band — a subtle equatorial ring, no decoration.
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(RADIUS * 1.12, RADIUS * 1.135, 96),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color("#21d4fd"),
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = Math.PI / 2.35;
      group.add(ring);

      // Marker dots on Kenya, Uganda, Tanzania, Rwanda, Ethiopia.
      const markerGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const markerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#21d4fd"),
        transparent: true,
        opacity: 0.95,
      });
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#21d4fd"),
        transparent: true,
        opacity: 0.28,
      });

      const halos: THREE_NS.Mesh[] = [];
      MARKERS.forEach((m) => {
        const p = latLngToVec3(m.lat, m.lng, RADIUS * 1.01);
        const dot = new THREE.Mesh(markerGeo, markerMat);
        dot.position.set(p.x, p.y, p.z);
        group.add(dot);

        const halo = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), haloMat.clone());
        halo.position.copy(dot.position);
        group.add(halo);
        halos.push(halo);
      });

      // Orient East Africa toward the camera.
      group.rotation.y = -0.72;
      group.rotation.x = 0.16;

      const clock = new THREE.Clock();

      const render = () => {
        renderer.render(scene, camera);
      };

      const animate = () => {
        frame = requestAnimationFrame(animate);
        // Pause out of viewport (brief).
        if (!inViewRef.current) return;

        const t = clock.getElapsedTime();
        group.rotation.y += 0.0014; // slow rotation
        halos.forEach((h, i) => {
          const s = 1 + Math.sin(t * 1.6 + i * 1.1) * 0.28;
          h.scale.setScalar(s);
          (h.material as THREE_NS.MeshBasicMaterial).opacity = 0.3 - Math.sin(t * 1.6 + i * 1.1) * 0.14;
        });
        render();
      };

      if (reduced) {
        // Reduced motion: render one static frame, no RAF loop.
        render();
      } else {
        animate();
      }

      const onResize = () => {
        if (!hostRef.current) return;
        const w = hostRef.current.clientWidth;
        const h = hostRef.current.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        render();
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", onResize);
        scene.traverse((obj) => {
          const mesh = obj as THREE_NS.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  return (
    <div className={styles.wrap} ref={viewRef} aria-hidden="true">
      <div className={styles.canvas} ref={hostRef} />
    </div>
  );
}
