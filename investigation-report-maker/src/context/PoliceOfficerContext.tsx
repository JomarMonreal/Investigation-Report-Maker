import React, { createContext, useContext, useState, useEffect } from "react";

interface PoliceOfficer {
  id: number;
  name: string;
  age: number;
  station: string;
  homeAddress: string;
  rank: string;
  contactNumber: string;
}

interface PoliceOfficerContextProps {
  officers: PoliceOfficer[];
  addOfficer: (officer: Omit<PoliceOfficer, "id">) => void;
  updateOfficer: (id: number, updatedOfficer: Omit<PoliceOfficer, "id">) => void;
  deleteOfficer: (id: number) => void;
}

const PoliceOfficerContext = createContext<PoliceOfficerContextProps | undefined>(undefined);

export const PoliceOfficerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);

  useEffect(() => {
    const storedOfficers = localStorage.getItem("officers");
    if (storedOfficers) {
      setOfficers(JSON.parse(storedOfficers));
    }
  }, []);

  const addOfficer = (officer: Omit<PoliceOfficer, "id">) => {
    setOfficers((prev) => [...prev, { id: Date.now(), ...officer }]);
  };

  const updateOfficer = (id: number, updatedOfficer: Omit<PoliceOfficer, "id">) => {
    setOfficers((prev) =>
      prev.map((officer) => (officer.id === id ? { id, ...updatedOfficer } : officer))
    );
  };

  const deleteOfficer = (id: number) => {
    setOfficers((prev) => prev.filter((officer) => officer.id !== id));
  };

  return (
    <PoliceOfficerContext.Provider value={{ officers, addOfficer, updateOfficer, deleteOfficer }}>
      {children}
    </PoliceOfficerContext.Provider>
  );
};

export const usePoliceOfficerContext = (): PoliceOfficerContextProps => {
  const context = useContext(PoliceOfficerContext);
  if (!context) {
    throw new Error("usePoliceOfficerContext must be used within a PoliceOfficerProvider");
  }
  return context;
};