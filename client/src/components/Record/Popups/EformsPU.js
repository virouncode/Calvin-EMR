import { CircularProgress } from "@mui/material";
import { PDFDocument } from "pdf-lib";
import React, { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { postPatientRecord } from "../../../api/fetchRecords";
import axiosXano from "../../../api/xano";
import useAuth from "../../../hooks/useAuth";
import ConfirmGlobal from "../../Confirm/ConfirmGlobal";
import Eform from "../Topics/Eforms/Eform";
import EformItem from "../Topics/Eforms/EformItem";
const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const EformsPU = ({
  patientId,
  patientInfos,
  showDocument,
  setPopUpVisible,
  datas,
  setDatas,
  errMsg,
  isLoading,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [addVisible, setAddVisible] = useState(false);
  const [columnToSort, setColumnToSort] = useState("date_created");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const direction = useRef(false);

  //STYLE
  const DIALOG_CONTAINER_STYLE = {
    height: "100vh",
    width: "200vw",
    fontFamily: "Arial",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    top: "0px",
    left: "0px",
    background: "rgba(0,0,0,0.8)",
    zIndex: "100000",
  };

  //HANDLERS
  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
  };

  const handleAdd = (e) => {
    setAddVisible((v) => !v);
  };

  const handleClose = async (e) => {
    setPopUpVisible(false);
  };

  const handleAddToRecord = (e) => {
    let input = e.nativeEvent.view.document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.onchange = (e) => {
      // getting a hold of the file reference
      let file = e.target.files[0];
      if (file.size > 25000000) {
        toast.error("The file is over 25Mb, please choose another one", {
          containerId: "B",
        });
        return;
      }
      setIsLoadingFile(true);
      // setting up the reader`
      let reader = new FileReader();
      reader.readAsDataURL(file);
      // here we tell the reader what to do when it's done reading...
      reader.onload = async (e) => {
        let content = e.target.result;
        try {
          const response = await axiosXano.post(
            "/upload/attachment",
            {
              content: content,
            },
            {
              headers: {
                Authorization: `Bearer ${auth.authToken}`,
              },
            }
          );
          //flatten the pdf
          const formUrl = `${BASE_URL}${response.data.path}`;
          const formPdfBytes = await fetch(formUrl).then((res) =>
            res.arrayBuffer()
          );
          const pdfDoc = await PDFDocument.load(formPdfBytes);
          const form = pdfDoc.getForm();
          form.flatten();
          const pdfBytes = await pdfDoc.save();
          //read the new flattened pdf
          let reader2 = new FileReader();
          reader2.readAsDataURL(
            new Blob([pdfBytes], { type: "application/pdf" })
          );
          // here we tell the reader what to do when it's done reading...
          reader2.onload = async (e) => {
            let content = e.target.result;
            try {
              const response2 = await axiosXano.post(
                "/upload/attachment",
                {
                  content: content,
                },
                {
                  headers: {
                    Authorization: `Bearer ${auth.authToken}`,
                  },
                }
              );
              const datasToPost = {
                patient_id: patientId,
                name: file.name,
                file: response2.data,
              };
              const response = await postPatientRecord(
                "/eforms",
                user.id,
                auth.authToken,
                datasToPost
              );
              socket.emit("message", {
                route: "E-FORMS",
                action: "create",
                content: { data: response.data },
              });

              toast.success(`Form successfully added to patient record`, {
                containerId: "B",
              });
              setIsLoadingFile(false);
            } catch (err) {}
          };
        } catch (err) {
          toast.error(`Error: unable to save file: ${err.message}`, {
            containerId: "B",
          });
          setIsLoadingFile(false);
        }
      };
    };
    input.click();
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="eforms__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="eforms__title">
                Patient e-forms <i className="fa-regular fa-newspaper"></i>
              </h1>
              <table className="eforms__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>Name</th>
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
                        .map((eform) => (
                          <EformItem item={eform} key={eform.id} />
                        ))
                    : datas
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((eform) => (
                          <EformItem
                            item={eform}
                            key={eform.id}
                            showDocument={showDocument}
                          />
                        ))}
                </tbody>
              </table>
              <div className="eforms__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add e-form
                </button>
                <button onClick={handleClose} disabled={isLoadingFile}>
                  Close
                </button>
              </div>
              {addVisible && (
                <Eform
                  setAddVisible={setAddVisible}
                  patientId={patientId}
                  patientInfos={patientInfos}
                  handleAddToRecord={handleAddToRecord}
                  isLoadingFile={isLoadingFile}
                />
              )}
            </>
          )
        )
      ) : (
        <CircularProgress />
      )}
      <ConfirmGlobal containerStyle={DIALOG_CONTAINER_STYLE} />
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

export default EformsPU;
