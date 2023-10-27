import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import FamilyDoctorForm from "./FamilyDoctorForm";
import FamilyDoctorListItem from "./FamilyDoctorListItem";
var _ = require("lodash");

const FamilyDoctorsList = ({
  handleAddItemClick,
  datas,
  patientId,
  setErrMsgPost,
}) => {
  const { auth } = useAuth();
  const direction = useRef(true);
  const [doctorsList, setDoctorsList] = useState(null);
  const [addNew, setAddNew] = useState(false);
  useEffect(() => {
    const abortController = new AbortController();
    const fetchAllDoctors = async () => {
      try {
        const response = await axiosXano.get("/all_doctors", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
          signal: abortController.signal,
        });
        setDoctorsList(response.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          toast.error(`Error: unable to fetch all doctors: ${err.message}`, {
            containerId: "B",
          });
        }
      }
    };
    fetchAllDoctors();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken]);

  //HANDLERS
  const handleSort = (columnName) => {
    let sortedDoctors = [...doctorsList];
    direction.current = !direction.current;
    direction.current
      ? sortedDoctors.sort((a, b) =>
          a[columnName]?.toString().localeCompare(b[columnName]?.toString())
        )
      : sortedDoctors.sort((a, b) =>
          b[columnName]?.toString().localeCompare(a[columnName]?.toString())
        );
    setDoctorsList(sortedDoctors);
  };

  const handleAddNewClick = () => {
    setAddNew((v) => !v);
  };

  return (
    <>
      <div className="doctors-list__title">
        Doctors database
        <button onClick={handleAddNewClick}>
          Add a new doctor to database
        </button>
      </div>
      <table className="doctors-list__table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("speciality")}>Speciality</th>
            <th onClick={() => handleSort("licence_nbr")}>Licence Nbr</th>
            <th onClick={() => handleSort("address")}>Adress</th>
            <th onClick={() => handleSort("province_state")}>Province/State</th>
            <th onClick={() => handleSort("postal_code")}>Postal Code</th>
            <th onClick={() => handleSort("city")}>City</th>
            <th onClick={() => handleSort("country")}>Country</th>
            <th onClick={() => handleSort("phone")}>Phone</th>
            <th onClick={() => handleSort("fax")}>Fax</th>
            <th onClick={() => handleSort("email")}>Email</th>
            <th onClick={() => handleSort("ohip_billing_nbr")}>OHIP#</th>
            <th onClick={() => handleSort("created_by_name")}>Created By</th>
            <th onClick={() => handleSort("date_created")}>Created On</th>
            <th style={{ textDecoration: "none", cursor: "default" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {addNew && (
            <FamilyDoctorForm
              setDoctorsList={setDoctorsList}
              setAddNew={setAddNew}
              patientId={patientId}
              setErrMsgPost={setErrMsgPost}
            />
          )}
          {doctorsList &&
            doctorsList
              .filter(({ id }) => _.findIndex(datas, { id: id }) === -1)
              .map((doctor) => (
                <FamilyDoctorListItem
                  key={doctor.id}
                  item={doctor}
                  handleAddItemClick={handleAddItemClick}
                />
              ))}
        </tbody>
      </table>
    </>
  );
};

export default FamilyDoctorsList;
