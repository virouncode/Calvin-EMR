import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axiosXanoPatient from "../../../api/xanoPatient";
import useAuth from "../../../hooks/useAuth";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import MessageExternal from "../../Messaging/External/MessageExternal";
import MessagesAttachments from "../../Messaging/MessagesAttachments";

const ReplyMessagePatient = ({
  setReplyVisible,
  message,
  previousMsgs,
  setCurrentMsgId,
}) => {
  const { auth, user, clinic, socket } = useAuth();
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleCancel = (e) => {
    setReplyVisible(false);
  };
  const handleSend = async (e) => {
    try {
      const attachmentsToPost = attachments.map((attachment) => {
        return { ...attachment, date_created: Date.now() };
      });
      let attach_ids = (
        await axiosXanoPatient.post(
          "/attachments",
          {
            attachments_array: attachmentsToPost,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data;

      attach_ids = [...message.attachments_ids, ...attach_ids];

      const replyMessage = {
        from_id: user.id,
        from_user_type: "patient",
        to_id: message.from_id,
        to_user_type: "staff",
        subject: previousMsgs.length
          ? `Re ${previousMsgs.length + 1}: ${message.subject.slice(
              message.subject.indexOf(":") + 1
            )}`
          : `Re: ${message.subject}`,
        body: body,
        attachments_ids: attach_ids,
        read_by_patient_id: user.id,
        previous_messages_ids: [
          ...previousMsgs.map(({ id }) => id),
          message.id,
        ],
        date_created: Date.now(),
      };

      const response = await axiosXanoPatient.post(
        "/messages_external",
        replyMessage,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      socket.emit("message", {
        route: "MESSAGES INBOX EXTERNAL",
        action: "create",
        content: { data: response.data },
      });
      setReplyVisible(false);
      setCurrentMsgId(0);
      toast.success("Message sent successfully", { containerId: "A" });
    } catch (err) {
      toast.error(`Error: unable to send message: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleChange = (e) => {
    setBody(e.target.value);
  };

  const handleAttach = (e) => {
    let input = e.nativeEvent.view.document.createElement("input");
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
          const response = await axiosXanoPatient.post(
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
              created_by_user_type: "patient",
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

  return (
    <div className="reply-message__form">
      <div className="reply-message__title">
        <p>
          <strong>To: </strong>
          {staffIdToTitleAndName(clinic.staffInfos, message.from_id, true)}
        </p>
      </div>
      <div className="reply-message__subject">
        <strong>Subject:</strong>
        {previousMsgs.length
          ? `\u00A0Re ${previousMsgs.length + 1}: ${message.subject.slice(
              message.subject.indexOf(":") + 1
            )}`
          : `\u00A0Re: ${message.subject}`}
      </div>
      <div className="reply-message__attach">
        <strong>Attach files</strong>
        <i className="fa-solid fa-paperclip" onClick={handleAttach}></i>
        {attachments.map((attachment) => (
          <span key={attachment.file.name} style={{ marginLeft: "5px" }}>
            {attachment.alias},
          </span>
        ))}
      </div>
      <div className="reply-message__body">
        <textarea value={body} onChange={handleChange}></textarea>
        <div className="reply-message__history">
          <MessageExternal message={message} key={message.id} index={0} />
          {previousMsgs.map((message, index) => (
            <MessageExternal
              message={message}
              key={message.id}
              index={index + 1}
            />
          ))}
        </div>
        <MessagesAttachments
          attachments={attachments}
          handleRemoveAttachment={handleRemoveAttachment}
          deletable={true}
          cardWidth="17%"
          addable={false}
        />
      </div>
      <div className="reply-message__btns">
        <button onClick={handleSend} disabled={isLoadingFile}>
          Send
        </button>
        <button onClick={handleCancel}>Cancel</button>
        {isLoadingFile && (
          <CircularProgress size="1rem" style={{ margin: "5px" }} />
        )}
      </div>
      <ToastContainer
        enableMultiContainer
        containerId={"B"}
        position="bottom-right"
        autoClose={1000}
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
    </div>
  );
};

export default ReplyMessagePatient;
