import React from "react";
import { extractToText } from "../../../../utils/extractToText";
import { getAge } from "../../../../utils/getAge";

const AddAIDocumentItem = ({
  document,
  setMessages,
  documentsAddedIds,
  setDocumentsAddedIds,
  documentsTextsToAdd,
  setDocumentsTextsToAdd,
  attachmentsTextsToAdd,
  initialBody,
  patientInfos,
  isLoadingDocumentText,
  setIsLoadingDocumentText,
  isLoadingAttachmentText,
}) => {
  const isChecked = (id) => documentsAddedIds.includes(id);
  const handleChange = async (e) => {
    const checked = e.target.checked;
    const id = parseInt(e.target.id);
    let documentsTextsToAddUpdated;
    if (checked) {
      setDocumentsAddedIds([...documentsAddedIds, id]);
      setIsLoadingDocumentText(true);
      let textToAdd = (
        await extractToText(document.file.url, document.file.mime)
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

      documentsTextsToAddUpdated = [
        ...documentsTextsToAdd,
        { id, content: textToAdd, date_created: document.date_created },
      ].sort((a, b) => a.date_created - b.date_created);
      setDocumentsTextsToAdd(documentsTextsToAddUpdated);
      setIsLoadingDocumentText(false);
    } else {
      let updatedIds = [...documentsAddedIds];
      updatedIds = updatedIds.filter((documentId) => documentId !== id);
      setDocumentsAddedIds(updatedIds);
      documentsTextsToAddUpdated = [...documentsTextsToAdd].filter(
        (text) => text.id !== id
      );
      setDocumentsTextsToAdd(documentsTextsToAddUpdated);
    }
    const newMessage = `Hello I'm a doctor.
    
My patient is a ${getAge(patientInfos.date_of_birth)} year-old ${
      patientInfos.gender_at_birth
    } with the following symptoms:

${initialBody}.

${
  documentsTextsToAddUpdated.length || attachmentsTextsToAdd.length
    ? `Here are further informations that you may use:

${
  attachmentsTextsToAdd.length > 0
    ? attachmentsTextsToAdd.map(({ content }) => content).join("\n")
    : ""
}         
${
  documentsTextsToAddUpdated.length > 0
    ? documentsTextsToAddUpdated.map(({ content }) => content).join("\n")
    : ""
}`
    : ""
}
    
What is the diagnosis and what treatment would you suggest ?`;
    setMessages([{ role: "user", content: newMessage }]);
  };

  return (
    <div className="calvinai-prompt__document-item">
      <input
        type="checkbox"
        id={document.id}
        checked={isChecked(document.id)}
        onChange={handleChange}
        disabled={isLoadingDocumentText || isLoadingAttachmentText}
      />
      <label>{document.description}</label>
    </div>
  );
};

export default AddAIDocumentItem;
