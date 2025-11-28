import React, { useState, useEffect } from "react";
import { PoliceOfficerContext } from "./PoliceOfficerContext";
import type { Officer, PoliceStation } from "../types/CaseDatails";

export interface PoliceOfficerContextProps {
  policeStation: PoliceStation;
  setPoliceStation: React.Dispatch<React.SetStateAction<PoliceStation>>;
  officers: Officer[];
  addOfficer: (officer: Officer) => void;
  updateOfficer: (id: string, updatedOfficer: Omit<Officer, "badgeNumber">) => void;
  deleteOfficer: (id: string) => void;
  officerByName: (name: string) => Officer | undefined; // Added to context props
}

export const PoliceOfficerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const  [policeStation, setPoliceStation] = useState<PoliceStation>({
      name: "",
      address: {
        barangay: "",
        cityOrMunicipality: "",
        province: "",
        street: "",
        postalCode: "",
        country: "Philippines",
      },
      contactNumber: "",
      email: "",
    });

  useEffect(() => {
    const storedOfficers = localStorage.getItem("investigation_officers");
    if (storedOfficers) {
      setOfficers(JSON.parse(storedOfficers));
    }
    const storedStation = localStorage.getItem("policeStation");
    if (storedStation) {
      setPoliceStation(JSON.parse(storedStation));
    }
  }, []);

  const addOfficer = (officer: Officer) => {
    setOfficers((prev) => [...prev, officer]);
    localStorage.setItem("investigation_officers", JSON.stringify([...officers, officer]));
  };

  const updateOfficer = (id: string, updatedOfficer: Omit<Officer, "badgeNumber">) => {
    setOfficers((prev) =>
      prev.map((officer) => (officer.badgeNumber === id ? { badgeNumber: id, ...updatedOfficer } : officer))
    );
    localStorage.setItem("investigation_officers", JSON.stringify(
      officers.map((officer) => (officer.badgeNumber === id ? { badgeNumber: id, ...updatedOfficer } : officer))
    ));
  };

  const deleteOfficer = (id: string) => {
    setOfficers((prev) => prev.filter((officer) => officer.badgeNumber !== id));
    localStorage.setItem("investigation_officers", JSON.stringify(
      officers.filter((officer) => officer.badgeNumber !== id)
    ));
  };

  const officerByName = (name: string): Officer | undefined => {
    return officers.find((officer) => officer.fullName.toLowerCase() === name.toLowerCase());
  };


  return (
    <PoliceOfficerContext.Provider value={{ policeStation, setPoliceStation, officers, addOfficer, updateOfficer, deleteOfficer, officerByName }}>
      {children}
    </PoliceOfficerContext.Provider>
  );
};
