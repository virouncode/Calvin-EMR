import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterUpper } from "../../../../utils/firstLetterUpper";

const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const DocumentForm = ({
  patientId,
  setAddVisible,
  editCounter,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    assigned_id: user.id,
    description: "",
    file: null,
  });
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    setFormDatas({
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    });
    const datasToPost = {
      ...formDatas,
      description: firstLetterUpper(formDatas.description),
    };
    if (!datasToPost.file.type) datasToPost.file.type = "document";
    //Validation
    if (datasToPost.description === "") {
      setErrMsgPost("Description field is required");
      return;
    }
    try {
      const response = await postPatientRecord(
        "/documents",
        user.id,
        auth.authToken,
        datasToPost,
        socket,
        "DOCUMENTS"
      );
      socket.emit("message", {
        route: "DOCMAILBOX",
        action: "create",
        content: { data: response.data },
      });

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to save document: ${err.message}`, {
        containerId: "B",
      });
    }
  };
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrMsgPost("");
    setSaveDisabled(true);
    if (file.size > 25000000) {
      setErrMsgPost("The file is over 25Mb, please choose another file");
      setIsLoadingFile(false);
      return;
    }
    // setting up the reader
    setIsLoadingFile(true);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    // here we tell the reader what to do when it's done reading...
    reader.onload = async (e) => {
      let content = e.target.result; // this is the content!
      let fileToUpload;
      try {
        fileToUpload = await axiosXano.post(
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
        setIsLoadingFile(false);
        setSaveDisabled(false);
        setFormDatas({
          ...formDatas,
          file: fileToUpload.data,
          description: file.name,
        });
      } catch (err) {
        setIsLoadingFile(false);
        toast.error(`Error unable to load document: ${err.message}`, {
          containerId: "B",
        });
      }
    };
  };

  return (
    <div className="documents__form">
      <form className="documents__content" onSubmit={handleSubmit}>
        <div className="documents__row">
          <label>Description</label>
          <input
            name="description"
            type="text"
            value={formDatas.description}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="documents__row">
          <label>Upload document</label>
          <input
            name="file"
            required
            type="file"
            onChange={handleUpload}
            accept=".jpeg, .jpg, .png, .gif, .tif, .pdf, .svg, .mp3, .aac, .aiff, .flac, .ogg, .wma, .wav, .mov, .mp4, .avi, .wmf, .flv, .doc, .docm, .docx, .txt, .csv, .xls, .xlsx, .ppt, .pptx"
          />
        </div>
        <div className="documents__row">
          {!saveDisabled && <input type="submit" value="Save" />}
        </div>
        <div className="documents__row">
          {isLoadingFile && (
            <CircularProgress size="1rem" style={{ margin: "5px" }} />
          )}
        </div>
        {formDatas.file && formDatas.file.mime.includes("image") ? (
          <img src={`${BASE_URL}${formDatas.file.path}`} alt="" width="100%" />
        ) : formDatas.file && formDatas.file.mime.includes("video") ? (
          <video controls>
            <source
              src={`${BASE_URL}${formDatas.file.path}`}
              type={formDatas.file.mime}
            />
          </video>
        ) : formDatas.file && formDatas.file.mime.includes("officedocument") ? (
          <div>
            <iframe
              title="office document"
              src={`https://docs.google.com/gview?url=${BASE_URL}${formDatas.file.path}&embedded=true&widget=false`}
              width="100%"
              height="500px"
              frameBorder="0"
            />
          </div>
        ) : (
          formDatas.file && (
            <iframe
              title={formDatas.alias}
              src={`${BASE_URL}${formDatas.file.path}`}
              type={formDatas.file.type}
              width="100%"
              style={{ border: "none" }}
              height="500px"
            />
          )
        )}
      </form>
    </div>
  );
};

export default DocumentForm;
