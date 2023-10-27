import React from "react";
import AttachmentCard from "./AttachmentCard";

const ProgressNotesAttachments = ({
  patientId,
  attachmentsLoading,
  attachments,
  deletable,
  handleRemoveAttachment = null,
  addable,
}) => {
  return (
    attachments && (
      <div className="progress-notes__attachments">
        {attachments.map((attachment) => (
          <AttachmentCard
            handleRemoveAttachment={handleRemoveAttachment}
            attachment={attachment}
            key={attachment.id}
            deletable={deletable}
            patientId={patientId}
            addable={addable}
            attachmentsLoading={attachmentsLoading}
          />
        ))}
      </div>
    )
  );
};

export default ProgressNotesAttachments;
