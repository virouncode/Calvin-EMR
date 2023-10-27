import React from "react";
import PatientTopic from "./PatientTopic";

const PatientMenuRight = ({ patientId, allContentsVisible, patientInfos }) => {
  return (
    <div className="patient-record__menu">
      <PatientTopic
        url="/social_history"
        textColor="#FEFEFE"
        backgroundColor="#495867"
        topic="SOCIAL HISTORY"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />

      <PatientTopic
        url="/reminders"
        textColor="#FEFEFE"
        backgroundColor="#577399"
        topic="REMINDERS/ALERTS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/pregnancies"
        textColor="#FEFEFE"
        backgroundColor="#326771"
        topic="PREGNANCIES"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/allergies"
        textColor="#FEFEFE"
        backgroundColor="#01ba95"
        topic="ALLERGIES"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/ongoing_concerns"
        textColor="#FEFEFE"
        backgroundColor="#2c8c99"
        topic="ONGOING CONCERNS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/documents"
        textColor="#FEFEFE"
        backgroundColor="#ef0b00"
        topic="DOCUMENTS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/vaccines"
        textColor="#FEFEFE"
        backgroundColor="#931621"
        topic="VACCINES"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="right"
        patientInfos={patientInfos}
      />
      <PatientTopic
        url="/appointments_for_patient"
        textColor="#FEFEFE"
        backgroundColor="#28464b"
        topic="APPOINTMENTS"
        patientId={patientId}
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/messages_about_patient"
        textColor="#FEFEFE"
        backgroundColor="#21201e"
        topic="MESSAGES ABOUT PATIENT"
        patientId={patientId}
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        side="right"
      />
      <PatientTopic
        url="/messages_external_for_patient"
        textColor="#FEFEFE"
        backgroundColor="#2acbd6"
        topic="MESSAGES WITH PATIENT"
        patientId={patientId}
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        side="right"
      />
    </div>
  );
};
export default PatientMenuRight;
