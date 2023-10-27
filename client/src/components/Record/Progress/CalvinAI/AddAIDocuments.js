import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import AddAIDocumentItem from "./AddAIDocumentItem";

const AddAIDocuments = ({
  documents,
  messages,
  setMessages,
  patientInfos,
  initialBody,
  isLoadingDocumentText,
  setIsLoadingDocumentText,
  isLoadingAttachmentText,
  documentsTextsToAdd,
  setDocumentsTextsToAdd,
  attachmentsTextsToAdd,
}) => {
  const [documentsAddedIds, setDocumentsAddedIds] = useState([]);

  return (
    <div className="calvinai-prompt__documents">
      <p>
        Add documents datas
        {isLoadingDocumentText && (
          <CircularProgress size="0.8rem" style={{ marginLeft: "5px" }} />
        )}
      </p>
      {documents.map((document) => (
        <AddAIDocumentItem
          document={document}
          setMessages={setMessages}
          messages={messages}
          key={document.id}
          documentsAddedIds={documentsAddedIds}
          setDocumentsAddedIds={setDocumentsAddedIds}
          documentsTextsToAdd={documentsTextsToAdd}
          setDocumentsTextsToAdd={setDocumentsTextsToAdd}
          attachmentsTextsToAdd={attachmentsTextsToAdd}
          patientInfos={patientInfos}
          initialBody={initialBody}
          isLoadingDocumentText={isLoadingDocumentText}
          setIsLoadingDocumentText={setIsLoadingDocumentText}
          isLoadingAttachmentText={isLoadingAttachmentText}
        />
      ))}
    </div>
  );
};

export default AddAIDocuments;
