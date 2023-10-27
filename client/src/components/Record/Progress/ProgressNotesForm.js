import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../api/fetchRecords";
import axiosXano from "../../../api/xano";
import useAuth from "../../../hooks/useAuth";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import { confirmAlert } from "../../Confirm/ConfirmGlobal";
import FakeWindow from "../../Presentation/FakeWindow";
import EditTemplate from "./EditTemplate";
import NewTemplate from "./NewTemplate";
import ProgressNotesAttachments from "./ProgressNotesAttachments";
import ProgressNotesTemplatesList from "./ProgressNotesTemplatesList";

const ProgressNotesForm = ({ setAddVisible, patientId, order }) => {
  //hooks
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    object: "Progress note",
    body: "",
    version_nbr: 1,
    attachments_ids: [],
  });
  const [attachments, setAttachments] = useState([]);
  const [templateSelectedId, setTemplateSelectedId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [newTemplateVisible, setNewTemplateVisible] = useState(false);
  const [editTemplateVisible, setEditTemplateVisible] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchTemplates = async () => {
      try {
        const response = await axiosXano.get("/progress_notes_templates", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
          signal: abortController.signal,
        });
        if (abortController.signal.aborted) return;
        setTemplates(
          response.data.sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )
        );
      } catch (err) {
        if (err.name !== "CanceledError") {
          toast.error(`Error: unable to fetch templates: ${err.message}`, {
            containerId: "A",
          });
        }
      }
    };
    fetchTemplates();
    return () => abortController.abort();
  }, [auth.authToken]);

  //HANDLERS
  const handleCancelClick = async () => {
    if (
      await confirmAlert({
        content: "Do you really want to cancel ? You changes won't be saved",
      })
    ) {
      setAddVisible(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const attach_ids = (
        await postPatientRecord("/attachments", user.id, auth.authToken, {
          attachments_array: attachments,
        })
      ).data;

      await postPatientRecord(
        "/progress_notes",
        user.id,
        auth.authToken,
        {
          ...formDatas,
          attachments_ids: attach_ids,
        },
        socket,
        "PROGRESS NOTES"
      );
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "A" });
    } catch (err) {
      toast.error(`Error: unable to save progress note: ${err.message}`, {
        containerId: "A",
      });
    }
  };
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleAttach = () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept =
      ".jpeg, .jpg, .png, .gif, .tif, .pdf, .svg, .mp3, .aac, .aiff, .flac, .ogg, .wma, .wav, .mov, .mp4, .avi, .wmf, .flv, .doc, .docm, .docx, .txt, .csv, .xls, .xlsx, .ppt, .pptx";
    input.onchange = (e) => {
      // getting a hold of the file reference
      let file = e.target.files[0];
      if (file.size > 25000000) {
        toast.error(
          "The file is over 25Mb, please choose another one or send a link",
          { containerId: "B" }
        );
        return;
      }
      setIsLoadingFile(true);
      // setting up the reader`
      let reader = new FileReader();
      reader.readAsDataURL(file);
      // here we tell the reader what to do when it's done reading...
      reader.onload = async (e) => {
        let content = e.target.result; // this is the content!
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
          if (!response.data.type) response.data.type = "document";
          setAttachments([
            ...attachments,
            {
              file: response.data,
              alias: file.name,
              date_created: Date.now(),
              created_by_id: user.id,
              created_by_user_type: "staff",
            },
          ]); //meta, mime, name, path, size, type
          setIsLoadingFile(false);
        } catch (err) {
          toast.error(`Error: unable to load file: ${err.message}`, {
            containerId: "A",
          });
          setIsLoadingFile(false);
        }
      };
    };
    input.click();
  };

  const handleRemoveAttachment = (fileName) => {
    let updatedAttachments = [...attachments];
    updatedAttachments = updatedAttachments.filter(
      (attachment) => attachment.file.name !== fileName
    );
    setAttachments(updatedAttachments);
  };

  const handleSelectTemplate = (e) => {
    const value = parseInt(e.target.value);
    setTemplateSelectedId(value);
    if (value !== -1 && value !== -2) {
      setFormDatas({
        ...formDatas,
        body: templates.find(({ id }) => id === parseInt(value)).body,
      });
    } else if (value === -1) {
      setNewTemplateVisible(true);
    } else if (value === -2) {
      if (!templates.filter(({ author_id }) => author_id === user.id).length) {
        alert("You don't have any templates");
        setTemplateSelectedId("");
        return;
      }
      setEditTemplateVisible(true);
    }
  };

  return (
    <>
      <form className="progress-notes__form" onSubmit={handleSubmit}>
        <div className="progress-notes__form-header">
          <div className="progress-notes__form-row">
            <p>
              <strong>From: </strong>
              {staffIdToTitleAndName(clinic.staffInfos, user.id, true)}
            </p>
            <div className="progress-notes__form-template">
              <label>
                <strong>Use template: </strong>
              </label>
              <ProgressNotesTemplatesList
                templates={templates}
                templateSelectedId={templateSelectedId}
                handleSelectTemplate={handleSelectTemplate}
              />
            </div>
          </div>
          <div className="progress-notes__form-row">
            <div>
              {" "}
              <label>
                <strong>Subject: </strong>
              </label>
              <input
                type="text"
                name="object"
                onChange={handleChange}
                value={formDatas.object}
                autoComplete="off"
              />
            </div>
            <div>
              <label>
                <strong>Attach files: </strong>
              </label>
              <i
                className="fa-solid fa-paperclip"
                style={{ cursor: "pointer" }}
                onClick={handleAttach}
              ></i>
            </div>
          </div>
        </div>
        <div className="progress-notes__form-body">
          <textarea
            name="body"
            onChange={handleChange}
            value={formDatas.body}
          />
          <ProgressNotesAttachments
            attachments={attachments}
            handleRemoveAttachment={handleRemoveAttachment}
            deletable={true}
            addable={false}
          />
        </div>
        <div className="progress-notes__form-btns">
          <input type="submit" value="Save & Sign" disabled={isLoadingFile} />
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
          {isLoadingFile && (
            <CircularProgress size="1rem" style={{ margin: "5px" }} />
          )}
        </div>
      </form>
      {newTemplateVisible && (
        <FakeWindow
          title="NEW TEMPLATE"
          width={1000}
          height={500}
          x={(window.innerWidth - 1000) / 2}
          y={(window.innerHeight - 500) / 2}
          color={"#94bae8"}
          setPopUpVisible={setNewTemplateVisible}
          closeCross={false}
        >
          <NewTemplate
            setNewTemplateVisible={setNewTemplateVisible}
            templates={templates}
            setTemplateSelectedId={setTemplateSelectedId}
            setTemplates={setTemplates}
            setFormDatas={setFormDatas}
            formDatas={formDatas}
          />
        </FakeWindow>
      )}
      {editTemplateVisible && (
        <FakeWindow
          title="EDIT TEMPLATE"
          width={1000}
          height={500}
          x={(window.innerWidth - 1000) / 2}
          y={(window.innerHeight - 500) / 2}
          color={"#94bae8"}
          setPopUpVisible={setEditTemplateVisible}
        >
          <EditTemplate
            setEditTemplateVisible={setEditTemplateVisible}
            myTemplates={templates.filter(
              ({ author_id }) => author_id === user.id
            )}
            setTemplateSelectedId={setTemplateSelectedId}
            setTemplates={setTemplates}
            setFormDatas={setFormDatas}
            formDatas={formDatas}
          />
        </FakeWindow>
      )}{" "}
    </>
  );
};

export default ProgressNotesForm;
