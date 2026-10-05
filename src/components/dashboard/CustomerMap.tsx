"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { KES, NUM, customerGeo } from "@/data/analytics";
import styles from "./dashboard.module.css";

/**
 * Customer clusters by ward and county.
 *
 * Google Maps JavaScript API when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is present;
 * otherwise a proportional-bubble plot positioned from the same latitude and
 * longitude. The fallback is not a placeholder — it is readable, accessible,
 * costs nothing per view, and keeps the panel useful for workspaces that never
 * configure a Maps key.
 */

interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
      Marker: new (opts: Record<string, unknown>) => unknown;
      InfoWindow: new (opts: Record<string, unknown>) => {
        open: (map: unknown, marker: unknown) => void;
      };
      LatLngBounds: new () => { extend: (p: { lat: number; lng: number }) => void };
      SymbolPath: { CIRCLE: unknown };
    };
  };
  __dpMapsCallback?: () => void;
}

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function CustomerMap() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!KEY);

  useEffect(() => {
    if (!KEY || loaded) return;
    const w = window as GoogleMapsWindow;

    const init = () => {
      if (!ref.current || !w.google) return;
      const maps = w.google.maps;
      const map = new maps.Map(ref.current, {
        center: { lat: -1.2864, lng: 36.8172 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      const bounds = new maps.LatLngBounds();
      customerGeo.forEach((point) => {
        bounds.extend({ lat: point.lat, lng: point.lng });
        const marker = new maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map,
          title: `${point.area}, ${point.county}`,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 6 + (point.customers / 214) * 14,
            fillColor: "#17c1e8",
            fillOpacity: 0.72,
            strokeColor: "#2152ff",
            strokeWeight: 1.5,
          },
        });
        const info = new maps.InfoWindow({
          content: `<strong>${point.area}</strong><br>${point.county} County<br>${NUM(
            point.customers
          )} customers · ${KES(point.revenue, true)}`,
        });
        (marker as { addListener?: (e: string, cb: () => void) => void }).addListener?.(
          "click",
          () => info.open(map, marker)
        );
      });

      setLoaded(true);
    };

    if (w.google?.maps) {
      init();
      return;
    }

    const id = "google-maps-js";
    if (document.getElementById(id)) return;

    w.__dpMapsCallback = init;
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=__dpMapsCallback&loading=async`;
    script.async = true;
    script.onerror = () => setFailed(true);
    document.head.appendChild(script);
  }, [loaded]);

  const maxCustomers = Math.max(...customerGeo.map((p) => p.customers));

  if (!failed) {
    return <div className={styles.mapCanvas} ref={ref} aria-label="Customer map" role="img" />;
  }

  // Geographic fallback: Kenya's rough bounding box projected into the panel.
  const LAT = { min: -4.8, max: 1.2 };
  const LNG = { min: 33.9, max: 41.9 };

  return (
    <div>
      <div className={styles.mapFallback} role="img" aria-label="Customer clusters across Kenya">
        {customerGeo.map((point) => {
          const top = ((LAT.max - point.lat) / (LAT.max - LAT.min)) * 100;
          const left = ((point.lng - LNG.min) / (LNG.max - LNG.min)) * 100;
          const size = 14 + (point.customers / maxCustomers) * 34;
          return (
            <span
              key={point.area}
              className={styles.mapBubble}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
              }}
              title={`${point.area}, ${point.county} — ${NUM(point.customers)} customers, ${KES(
                point.revenue,
                true
              )}`}
            />
          );
        })}
        <span className={styles.mapNote}>
          <MapPin size={12} aria-hidden="true" />
          Add a Google Maps key in Settings for the interactive map
        </span>
      </div>

      <div className={styles.tableWrap} style={{ marginTop: 16 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Ward / area</th>
              <th scope="col">County</th>
              <th scope="col" className={styles.tdNumHead}>
                Customers
              </th>
              <th scope="col" className={styles.tdNumHead}>
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {customerGeo.map((point) => (
              <tr key={point.area}>
                <td className={styles.tdStrong}>{point.area}</td>
                <td>{point.county}</td>
                <td className={styles.tdNum}>{NUM(point.customers)}</td>
                <td className={styles.tdNum}>{KES(point.revenue, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
