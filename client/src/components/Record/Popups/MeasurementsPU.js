import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import MeasurementEvent from "../Topics/Measurements/MeasurementEvent";
import MeasurementForm from "../Topics/Measurements/MeasurementForm";

const MeasurementsPU = ({
  patientId,
  setPopUpVisible,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const [errMsgPost, setErrMsgPost] = useState("");
  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [columnToSort, setColumnToSort] = useState("date_created");
  const direction = useRef(false);

  //HANDLERS
  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
  };

  const handleClose = async (e) => {
    if (
      editCounter.current === 0 ||
      (editCounter.current > 0 &&
        (await confirmAlert({
          content:
            "Do you really want to close the window ? Your changes will be lost",
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

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="measurements__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="measurements__title">
                Patient measurements{" "}
                <i className="fa-solid fa-ruler-combined"></i>
              </h1>
              {errMsgPost && (
                <div className="measurements__err">{errMsgPost}</div>
              )}
              <table className="measurements__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("height_cm")}>Height(cm)</th>
                    <th onClick={() => handleSort("height_feet")}>
                      Height(feet)
                    </th>
                    <th onClick={() => handleSort("weight_kg")}>Weight(kg)</th>
                    <th onClick={() => handleSort("weight_lbs")}>
                      Weight(lbs)
                    </th>
                    <th onClick={() => handleSort("waist_circumference")}>
                      Waist Circumference (cm)
                    </th>
                    <th onClick={() => handleSort("body_mass_index")}>
                      Body Mass Index(kg/m2)
                    </th>
                    <th onClick={() => handleSort("body_surface_area")}>
                      Body Surface Area(m2)
                    </th>
                    <th onClick={() => handleSort("blood_pressure_systolic")}>
                      Systolic(mmHg)
                    </th>
                    <th onClick={() => handleSort("blood_pressure_diastolic")}>
                      Diastolic(mmHg)
                    </th>
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
                  {addVisible && (
                    <MeasurementForm
                      editCounter={editCounter}
                      setAddVisible={setAddVisible}
                      patientId={patientId}
                      setErrMsgPost={setErrMsgPost}
                    />
                  )}
                  {direction.current
                    ? datas
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((event) => (
                          <MeasurementEvent
                            event={event}
                            key={event.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((event) => (
                          <MeasurementEvent
                            event={event}
                            key={event.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                </tbody>
              </table>
              <div className="measurements__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add Measurement
                </button>
                <button onClick={handleClose}>Close</button>
              </div>
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

export default MeasurementsPU;
