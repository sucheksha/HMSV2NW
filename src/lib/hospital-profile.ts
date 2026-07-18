import { useEffect, useState } from "react";
import hospitalHero from "@/assets/hospital-hero.jpg";

export interface HospitalProfile {
  name: string;
  description: string;
  welcomeMessage: string;
  logoUrl: string | null;
  coverUrl: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  type: string;
  beds: number;
  departments: string[];
}

const STORAGE_KEY = "jeevix.hospital.profile";

export const DEFAULT_HOSPITAL: HospitalProfile = {
  name: "Aster Medcity",
  description:
    "Delivering quality healthcare through intelligent digital operations across cardiac, neuro, and transplant care.",
  welcomeMessage: "Welcome to your hospital workspace",
  logoUrl: null,
  coverUrl: hospitalHero,
  address: "Kuttisahib Road, Cheranalloor",
  city: "Kochi",
  state: "Kerala",
  country: "India",
  phone: "+91 484 669 9999",
  email: "info@astermedcity.com",
  website: "astermedcity.com",
  type: "Multispeciality (Quaternary)",
  beds: 670,
  departments: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Emergency"],
};

export function loadHospitalProfile(): HospitalProfile {
  if (typeof window === "undefined") return DEFAULT_HOSPITAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOSPITAL;
    return { ...DEFAULT_HOSPITAL, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOSPITAL;
  }
}

export function saveHospitalProfile(profile: HospitalProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent("jeevix:hospital-updated"));
}

export function useHospitalProfile() {
  const [profile, setProfile] = useState<HospitalProfile>(DEFAULT_HOSPITAL);
  useEffect(() => {
    setProfile(loadHospitalProfile());
    const handler = () => setProfile(loadHospitalProfile());
    window.addEventListener("jeevix:hospital-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("jeevix:hospital-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [profile, setProfile] as const;
}
