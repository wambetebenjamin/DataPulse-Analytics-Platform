"use client";

import { SlidersHorizontal } from "lucide-react";
import { openCookiePreferences } from "./CookieConsent";
import styles from "./manage-preferences.module.css";

/**
 * Re-opens the cookie preferences modal from inside the Cookie Policy page, so
 * consent can be withdrawn as easily as it was given (DPA 2019, s.32(4)).
 */
export default function ManagePreferencesButton() {
  return (
    <button type="button" className={styles.button} onClick={openCookiePreferences}>
      <SlidersHorizontal size={15} aria-hidden="true" />
      Manage cookie preferences
    </button>
  );
}
