import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import AddAIAttachmentItem from "./AddAIAttachmentItem";

const AddAIAttachments = ({
  attachments,
  messages,
  setMessages,
  patientInfos,
  initialBody,
  isLoadingAttachmentText,
  setIsLoadingAttachmentText,
  isLoadingDocumentText,
  attachmentsTextsToAdd,
  setAttachmentsTextsToAdd,
  documentsTextsToAdd,
}) => {
  const [attachmentsAddedIds, setAttachmentsAddedIds] = useState([]);

  return (
    <div className="calvinai-prompt__attachments">
      <p>
        Add attachments datas
        {isLoadingAttachmentText && (
          <CircularProgress size="0.8rem" style={{ marginLeft: "5px" }} />
        )}
      </p>
      {attachments.map((attachment) => (
        <AddAIAttachmentItem
          attachment={attachment}
          setMessages={setMessages}
          messages={messages}
          key={attachment.id}
          attachmentsAddedIds={attachmentsAddedIds}
          setAttachmentsAddedIds={setAttachmentsAddedIds}
          attachmentsTextsToAdd={attachmentsTextsToAdd}
          setAttachmentsTextsToAdd={setAttachmentsTextsToAdd}
          documentsTextsToAdd={documentsTextsToAdd}
          patientInfos={patientInfos}
          initialBody={initialBody}
          isLoadingAttachmentText={isLoadingAttachmentText}
          setIsLoadingAttachmentText={setIsLoadingAttachmentText}
          isLoadingDocumentText={isLoadingDocumentText}
        />
      ))}
    </div>
  );
};

export default AddAIAttachments;
