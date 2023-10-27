import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import DocumentForm from "../Topics/Documents/DocumentForm";
import DocumentItem from "../Topics/Documents/DocumentItem";

const DocumentsPU = ({
  patientId,
  showDocument,
  setPopUpVisible,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [columnToSort, setColumnToSort] = useState("date_created");
  const direction = useRef(false);

  //HANDLERS
  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
  };

  const handleAdd = (e) => {
    setErrMsgPost("");
    editCounter.current += 1;
    setAddVisible((v) => !v);
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

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="documents__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="documents__title">
                Patient documents <i className="fa-regular fa-folder"></i>
              </h1>
              {errMsgPost && <div className="documents__err">{errMsgPost}</div>}
              <table className="documents__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("description")}>
                      Description
                    </th>
                    <th onClick={() => handleSort("name")}>File Name</th>
                    <th onClick={() => handleSort("type")}>Type</th>
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
                  {columnToSort === "name" || columnToSort === "type"
                    ? direction.current
                      ? datas
                          .sort((a, b) =>
                            a.file[columnToSort]
                              ?.toString()
                              .localeCompare(b.file[columnToSort]?.toString())
                          )
                          .map((document) => (
                            <DocumentItem
                              item={document}
                              key={document.id}
                              showDocument={showDocument}
                              setErrMsgPost={setErrMsgPost}
                            />
                          ))
                      : datas
                          .sort((a, b) =>
                            b.file[columnToSort]
                              ?.toString()
                              .localeCompare(a.file[columnToSort]?.toString())
                          )
                          .map((document) => (
                            <DocumentItem
                              item={document}
                              key={document.id}
                              showDocument={showDocument}
                              setErrMsgPost={setErrMsgPost}
                            />
                          ))
                    : direction.current
                    ? datas
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((document) => (
                          <DocumentItem
                            item={document}
                            key={document.id}
                            showDocument={showDocument}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((document) => (
                          <DocumentItem
                            item={document}
                            key={document.id}
                            showDocument={showDocument}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                </tbody>
              </table>
              <div className="documents__btn-container">
                <button disabled={addVisible} onClick={handleAdd}>
                  Add document
                </button>
                <button onClick={handleClose}>Close</button>
              </div>
              {addVisible && (
                <DocumentForm
                  patientId={patientId}
                  setAddVisible={setAddVisible}
                  editCounter={editCounter}
                  setErrMsgPost={setErrMsgPost}
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

export default DocumentsPU;
