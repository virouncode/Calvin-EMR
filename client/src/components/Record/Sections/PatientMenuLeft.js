import React from "react";
import PatientTopic from "./PatientTopic";

const PatientMenuLeft = ({
  patientInfos,
  setPatientInfos,
  patientId,
  allContentsVisible,
}) => {
  return (
    <div className="patient-record__menu">
      <PatientTopic
        textColor="#FEFEFE"
        backgroundColor="#495867"
        topic="DEMOGRAPHICS"
        patientInfos={patientInfos}
        setPatientInfos={setPatientInfos}
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/medical_history"
        textColor="#FEFEFE"
        backgroundColor="#577399"
        topic="MEDICAL HISTORY"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/family_history"
        textColor="#FEFEFE"
        backgroundColor="#326771"
        topic="FAMILY HISTORY"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/relationships"
        textColor="#FEFEFE"
        backgroundColor="#01ba95"
        topic="RELATIONSHIPS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/doctors"
        textColor="#FEFEFE"
        backgroundColor="#2c8c99"
        topic="FAMILY DOCTORS/SPECIALISTS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/risk_factors"
        textColor="#FEFEFE"
        backgroundColor="#ef0b00"
        topic="RISK FACTORS/PREVENTION"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/medications"
        textColor="#FEFEFE"
        backgroundColor="#931621"
        topic="MEDICATIONS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
        patientInfos={patientInfos}
      />
      <PatientTopic
        url="/pharmacies"
        textColor="#FEFEFE"
        backgroundColor="#28464b"
        topic="PHARMACIES"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/measurements"
        textColor="#FEFEFE"
        backgroundColor="#21201e"
        topic="MEASUREMENTS"
        patientId={patientId}
        allContentsVisible={allContentsVisible}
        side="left"
      />
      <PatientTopic
        url="/eforms"
        textColor="#FEFEFE"
        backgroundColor="#2acbd6"
        topic="E-FORMS"
        patientId={patientId}
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        side="left"
      />
    </div>
  );
};

export default PatientMenuLeft;
