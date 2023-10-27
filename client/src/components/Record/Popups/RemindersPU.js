import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import ReminderForm from "../Topics/Reminders/ReminderForm";
import ReminderItem from "../Topics/Reminders/ReminderItem";

const RemindersPU = ({
  patientId,
  setPopUpVisible,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS

  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState(false);
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
          <p className="reminders__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="reminders__title">
                Patient reminders & alerts <i className="fa-solid fa-bell"></i>
              </h1>
              {errMsgPost && <div className="reminders__err">{errMsgPost}</div>}
              <table className="reminders__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("active")}>Active</th>
                    <th onClick={() => handleSort("reminder")}>Reminder</th>
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
                    <ReminderForm
                      editCounter={editCounter}
                      setAddVisible={setAddVisible}
                      patientId={patientId}
                      setErrMsgPost={setErrMsgPost}
                    />
                  )}
                  {direction.current
                    ? datas
                        .filter((reminder) => reminder.active)
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((reminder) => (
                          <ReminderItem
                            item={reminder}
                            key={reminder.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .filter((reminder) => reminder.active)
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((reminder) => (
                          <ReminderItem
                            item={reminder}
                            key={reminder.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                  {direction.current
                    ? datas
                        .filter((reminder) => !reminder.active)
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((reminder) => (
                          <ReminderItem
                            item={reminder}
                            key={reminder.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .filter((reminder) => !reminder.active)
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((reminder) => (
                          <ReminderItem
                            item={reminder}
                            key={reminder.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                </tbody>
              </table>
              <div className="reminders__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add Reminder
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

export default RemindersPU;
