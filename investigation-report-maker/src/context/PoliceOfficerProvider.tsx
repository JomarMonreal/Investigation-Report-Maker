import React, { useState, useEffect } from "react";
import { PoliceOfficerContext } from "./PoliceOfficerContext";
import type { Officer } from "../types/CaseDatails";

export interface PoliceOfficerContextProps {
  officers: Officer[];
  addOfficer: (officer: Officer) => void;
  updateOfficer: (id: string, updatedOfficer: Omit<Officer, "badgeNumber">) => void;
  deleteOfficer: (id: string) => void;
}


export const PoliceOfficerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);

  useEffect(() => {
    const storedOfficers = localStorage.getItem("officers");
    if (storedOfficers) {
      setOfficers(JSON.parse(storedOfficers));
    }
  }, []);

  const addOfficer = (officer: Officer) => {
    setOfficers((prev) => [...prev, officer]);
  };

  const updateOfficer = (id: string, updatedOfficer: Omit<Officer, "badgeNumber">) => {
    setOfficers((prev) =>
      prev.map((officer) => (officer.badgeNumber === id ? { badgeNumber: id, ...updatedOfficer } : officer))
    );
  };

  const deleteOfficer = (id: string) => {
    setOfficers((prev) => prev.filter((officer) => officer.badgeNumber !== id));
  };

  return (
    <PoliceOfficerContext.Provider value={{ officers, addOfficer, updateOfficer, deleteOfficer }}>
      {children}
    </PoliceOfficerContext.Provider>
  );
};
