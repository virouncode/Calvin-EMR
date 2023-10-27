import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { putPatientRecord } from "../../../api/fetchRecords";
import useAuth from "../../../hooks/useAuth";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import PharmaciesList from "../Topics/Pharmacies/PharmaciesList";
import PharmacyItem from "../Topics/Pharmacies/PharmacyItem";

const PharmaciesPU = ({
  patientId,
  setPopUpVisible,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const editCounter = useRef(0);
  const direction = useRef(false);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [columnToSort, setColumnToSort] = useState("date_created");

  //HANDLERS
  const handleClose = async (e) => {
    if (
      editCounter.current === 0 ||
      (editCounter.current > 0 &&
        (await confirmAlert({
          content: "Do you really want to close the window ?",
        })))
    ) {
      setPopUpVisible(false);
    }
  };

  const handleAdd = (e) => {
    setErrMsgPost("");
    editCounter.current += 1;
    setAddVisible((v) => !v);
  };

  const handleAddItemClick = async (item, e) => {
    //add patient id in pharmacies list
    const pharmacy = { ...item };
    const patients = [...pharmacy.patients, patientId];
    pharmacy.patients = patients;
    try {
      await putPatientRecord(
        "/pharmacies",
        item.id,
        user.id,
        auth.authToken,
        pharmacy
      );
      socket.emit("message", {
        route: "PHARMACIES",
        action: "create",
        content: { id: item.id, data: pharmacy },
      });
      toast.success("Pharmacy added to patient", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to add pharmacy: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="pharmacies__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="pharmacies__title">
                Patient pharmacies{" "}
                <i className="fa-solid fa-prescription-bottle-medical"></i>
              </h1>
              {errMsgPost && (
                <div className="pharmacies__err">{errMsgPost}</div>
              )}
              <table className="pharmacies__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>Name</th>
                    <th onClick={() => handleSort("address")}>Address</th>
                    <th onClick={() => handleSort("province_state")}>
                      Province/State
                    </th>
                    <th onClick={() => handleSort("postal_code")}>
                      Postal Code
                    </th>
                    <th onClick={() => handleSort("city")}>City</th>
                    <th onClick={() => handleSort("country")}>Country</th>
                    <th onClick={() => handleSort("phone")}>Phone</th>
                    <th onClick={() => handleSort("fax")}>Fax</th>
                    <th onClick={() => handleSort("email")}>Email</th>
                    <th onClick={() => handleSort("created_by_id")}>
                      Created By
                    </th>
                    <th onClick={() => handleSort("date_created")}>
                      Created On
                    </th>
                    <th style={{ textDecoration: "none", cursor: "default" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {direction.current
                    ? datas
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((item) => (
                          <PharmacyItem
                            item={item}
                            key={item.id}
                            editCounter={editCounter}
                            patientId={patientId}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((item) => (
                          <PharmacyItem
                            item={item}
                            key={item.id}
                            editCounter={editCounter}
                            patientId={patientId}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                </tbody>
              </table>
              <div className="pharmacies__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add a Pharmacy to patient
                </button>
                <button onClick={handleClose}>Close</button>
              </div>
              {addVisible && (
                <PharmaciesList
                  datas={datas}
                  handleAddItemClick={handleAddItemClick}
                  setErrMsgPost={setErrMsgPost}
                  patientId={patientId}
                />
              )}
            </>
          )
        )
      ) : (
        <CircularProgress />
      )}
      <ConfirmGlobal />
      <ToastContainer
        enableMultiContainer
        containerId={"B"}
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </>
  );
};

export default PharmaciesPU;
