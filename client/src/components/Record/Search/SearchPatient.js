import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { onMessageSearchPatients } from "../../../utils/socketHandlers/onMessageSearchPatients";
import PatientSearchForm from "./PatientSearchForm";
import PatientSearchResult from "./PatientSearchResult";

const SearchPatient = () => {
  const direction = useRef(false);
  const { clinic, socket, setClinic } = useAuth();
  const [sortedPatientsInfos, setSortedPatientsInfos] = useState(
    clinic.patientsInfos
  );
  const [search, setSearch] = useState({
    name: "",
    email: "",
    phone: "",
    birth: "",
    chart: "",
    health: "",
  });

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message) =>
      onMessageSearchPatients(
        message,
        sortedPatientsInfos,
        setSortedPatientsInfos,
        clinic,
        setClinic
      );
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [clinic, setClinic, socket, sortedPatientsInfos]);

  const handleSort = (columnName) => {
    const sortedPatientsInfosUpdated = [...sortedPatientsInfos];
    direction.current = !direction.current;
    if (
      columnName === "assigned_md_name" ||
      columnName === "assigned_resident_name" ||
      columnName === "assigned_nurse_name" ||
      columnName === "assigned_midwife_name" ||
      columnName === "assigned_us_tech_name" ||
      columnName === "assigned_physio_name" ||
      columnName === "assigned_psycho_name" ||
      columnName === "assigned_nutri_name"
    ) {
      direction.current
        ? sortedPatientsInfosUpdated.sort((a, b) =>
            a[columnName]?.full_name
              .toString()
              .localeCompare(b[columnName]?.full_name.toString())
          )
        : sortedPatientsInfosUpdated.sort((a, b) =>
            b[columnName]?.full_name
              .toString()
              .localeCompare(a[columnName]?.full_name.toString())
          );
    } else {
      direction.current
        ? sortedPatientsInfosUpdated.sort((a, b) =>
            a[columnName]?.toString().localeCompare(b[columnName]?.toString())
          )
        : sortedPatientsInfosUpdated.sort((a, b) =>
            b[columnName]?.toString().localeCompare(a[columnName]?.toString())
          );
    }
    setSortedPatientsInfos(sortedPatientsInfosUpdated);
  };
  return (
    <>
      <PatientSearchForm setSearch={setSearch} search={search} />
      <PatientSearchResult
        search={search}
        sortedPatientsInfos={sortedPatientsInfos}
        handleSort={handleSort}
      />
    </>
  );
};

export default SearchPatient;
