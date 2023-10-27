import React from "react";
import { extractToText } from "../../../../utils/extractToText";
import { getAge } from "../../../../utils/getAge";

const AddAIAttachmentItem = ({
  attachment,
  setMessages,
  attachmentsAddedIds,
  setAttachmentsAddedIds,
  attachmentsTextsToAdd,
  setAttachmentsTextsToAdd,
  documentsTextsToAdd,
  initialBody,
  patientInfos,
  isLoadingAttachmentText,
  setIsLoadingAttachmentText,
  isLoadingDocumentText,
}) => {
  const isChecked = (id) => attachmentsAddedIds.includes(id);
  const handleChange = async (e) => {
    const checked = e.target.checked;
    const id = parseInt(e.target.id);
    let attachmentsTextsToAddUpdated;
    if (checked) {
      setAttachmentsAddedIds([...attachmentsAddedIds, id]);
      setIsLoadingAttachmentText(true);
      let textToAdd = (
        await extractToText(attachment.file.url, attachment.file.mime)
      ).join("");

      textToAdd = textToAdd
        .replaceAll(patientInfos.first_name, "")
        .replaceAll(patientInfos.middle_name, "")
        .replaceAll(patientInfos.last_name, "")
        .replaceAll(patientInfos.health_insurance_nbr, "")
        .replaceAll(patientInfos.cell_phone, "")
        .replaceAll(patientInfos.preferred_phone, "")
        .replaceAll(patientInfos.address, "")
        .replaceAll(patientInfos.postal_code, "")
        .replaceAll(patientInfos.province_state, "")
        .replaceAll(patientInfos.city, "")
        .replaceAll(patientInfos.country, "")
        .replaceAll(patientInfos.email, "");

      attachmentsTextsToAddUpdated = [
        ...attachmentsTextsToAdd,
        { id, content: textToAdd, date_created: attachment.date_created },
      ].sort((a, b) => a.date_created - b.date_created);
      setAttachmentsTextsToAdd(attachmentsTextsToAddUpdated);
      setIsLoadingAttachmentText(false);
    } else {
      let updatedIds = [...attachmentsAddedIds];
      updatedIds = updatedIds.filter((attachmentId) => attachmentId !== id);
      setAttachmentsAddedIds(updatedIds);
      attachmentsTextsToAddUpdated = [...attachmentsTextsToAdd].filter(
        (text) => text.id !== id
      );
      setAttachmentsTextsToAdd(attachmentsTextsToAddUpdated);
    }
    const newMessage = `Hello I'm a doctor.
    
My patient is a ${getAge(patientInfos.date_of_birth)} year-old ${
      patientInfos.gender_at_birth
    } with the following symptoms:

${initialBody}.

${
  attachmentsTextsToAddUpdated.length || documentsTextsToAdd.length
    ? `Here are further informations that you may use:
           
${
  attachmentsTextsToAddUpdated.length > 0
    ? attachmentsTextsToAddUpdated.map(({ content }) => content).join("\n")
    : ""
}
${
  documentsTextsToAdd.length > 0
    ? documentsTextsToAdd.map(({ content }) => content).join("\n")
    : ""
}`
    : ""
}
    
What is the diagnosis and what treatment would you suggest ?`;
    setMessages([{ role: "user", content: newMessage }]);
  };

  return (
    <div className="calvinai-prompt__attachment-item">
      <input
        type="checkbox"
        id={attachment.id}
        checked={isChecked(attachment.id)}
        onChange={handleChange}
        disabled={isLoadingAttachmentText || isLoadingDocumentText}
      />
      <label>{attachment.alias}</label>
    </div>
  );
};

export default AddAIAttachmentItem;
