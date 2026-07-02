import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { BackendConfig } from "../config.js";

let firestore: Firestore | null = null;

/**
 * Returns a singleton Firestore client. When FIRESTORE_EMULATOR_HOST is set,
 * the Admin SDK connects to the local emulator and no credentials are needed;
 * otherwise Application Default Credentials are used (GOOGLE_APPLICATION_CREDENTIALS
 * or the ambient service account).
 */
export function getFirestoreDb(config: BackendConfig): Firestore {
  if (firestore) {
    return firestore;
  }

  if (getApps().length === 0) {
    const useEmulator = Boolean(config.firestoreEmulatorHost);
    initializeApp({
      projectId: config.firebaseProjectId || undefined,
      ...(useEmulator ? {} : { credential: applicationDefault() })
    });
  }

  firestore = getFirestore();
  return firestore;
}
