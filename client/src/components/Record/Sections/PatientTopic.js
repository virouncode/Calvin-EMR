import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { usePatientRecord } from "../../../hooks/usePatientRecord";
import { patientIdToName } from "../../../utils/patientIdToName";
import { onMessageTopic } from "../../../utils/socketHandlers/onMessageTopic";
import FakeWindow from "../../Presentation/FakeWindow";
import AllergiesPU from "../Popups/AllergiesPU";
import AppointmentsPU from "../Popups/AppointmentsPU";
import ConcernsPU from "../Popups/ConcernsPU";
import DemographicsPU from "../Popups/DemographicsPU";
import DocumentsPU from "../Popups/DocumentsPU";
import EformsPU from "../Popups/EformsPU";
import FamHistoryPU from "../Popups/FamHistoryPU";
import FamilyDoctorsPU from "../Popups/FamilyDoctorsPU";
import MeasurementsPU from "../Popups/MeasurementsPU";
import MedHistoryPU from "../Popups/MedHistoryPU";
import MedicationsPU from "../Popups/MedicationsPU";
import PharmaciesPU from "../Popups/PharmaciesPU";
import PregnanciesPU from "../Popups/PregnanciesPU";
import RelationshipsPU from "../Popups/RelationshipsPU";
import RemindersPU from "../Popups/RemindersPU";
import RiskPU from "../Popups/RiskPU";
import SocHistoryPU from "../Popups/SocHistoryPU";
import VaccinesPU from "../Popups/VaccinesPU";
import AllergiesContent from "../Topics/Allergies/AllergiesContent";
import AppointmentsContent from "../Topics/Appointments/AppointmentsContent";
import ConcernsContent from "../Topics/Concerns/ConcernsContent";
import DemographicsContent from "../Topics/Demographics/DemographicsContent";
import DocumentsContent from "../Topics/Documents/DocumentsContent";
import EformsContent from "../Topics/Eforms/EformsContent";
import FamHistoryContent from "../Topics/Family/FamHistoryContent";
import DoctorsContent from "../Topics/FamilyDoctors/FamilyDoctorsContent";
import MeasurementsContent from "../Topics/Measurements/MeasurementsContent";
import MedHistoryContent from "../Topics/MedHistory/MedHistoryContent";
import MedicationsContent from "../Topics/Medications/MedicationsContent";
import MessagesContent from "../Topics/MessagesAboutPatient/MessagesContent";
import MessagesExternalContent from "../Topics/MessagesWithPatient/MessagesExternalContent";
import PharmaciesContent from "../Topics/Pharmacies/PharmaciesContent";
import PregnanciesContent from "../Topics/Pregnancies/PregnanciesContent";
import RelationshipsContent from "../Topics/Relationships/RelationshipsContent";
import RemindersContent from "../Topics/Reminders/RemindersContent";
import RiskContent from "../Topics/Risks/RiskContent";
import SocHistoryContent from "../Topics/Social/SocHistoryContent";
import VaccinesContent from "../Topics/Vaccines/VaccinesContent";
import PatientTopicHeader from "./PatientTopicHeader";

const PatientTopic = ({
  url,
  backgroundColor,
  textColor,
  topic,
  patientId,
  patientInfos = {},
  setPatientInfos = null,
  allContentsVisible,
  side,
}) => {
  //HOOKS
  const { clinic, socket } = useAuth();
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [{ datas, isLoading, errMsg }, fetchRecord, setDatas] =
    usePatientRecord(url, patientId);
  const containerRef = useRef("null");

  useEffect(() => {
    if (!socket || topic === "DEMOGRAPHICS") return;
    const onMessage = (message) =>
      onMessageTopic(message, topic, datas, setDatas, patientId);
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [datas, patientId, setDatas, socket, topic]);

  //STYLE
  const TOPIC_STYLE = { color: textColor, background: backgroundColor };

  //HANDLERS
  const handlePopUpClick = (e) => {
    setPopUpVisible((v) => !v);
  };

  const handleTriangleClick = (e) => {
    e.target.classList.toggle("triangle--active");
    containerRef.current.classList.toggle(
      `patient-record__topic-container--active`
    );
  };

  const showDocument = async (docUrl, docMime) => {
    let docWindow;
    if (!docMime.includes("officedocument")) {
      docWindow = window.open(
        docUrl,
        "_blank",
        "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, width=800, height=600, left=320, top=200"
      );
    } else {
      docWindow = window.open(
        `https://docs.google.com/gview?url=${docUrl}`,
        "_blank",
        "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, width=800, height=600, left=320, top=200"
      );
    }

    if (docWindow === null) {
      alert("Please disable your browser pop-up blocker and sign in again");
      window.location.assign("/login");
      return;
    }
  };

  return (
    <div className="patient-record__topic">
      <div
        className={`patient-record__topic-header patient-record__topic-header--${side}`}
        style={TOPIC_STYLE}
      >
        <PatientTopicHeader
          topic={topic}
          handleTriangleClick={handleTriangleClick}
          handlePopUpClick={handlePopUpClick}
          allContentsVisible={allContentsVisible}
          popUpButton={
            topic === "MESSAGES WITH PATIENT" ||
            topic === "MESSAGES ABOUT PATIENT"
              ? false
              : true
          }
        />
      </div>
      <div
        className={
          allContentsVisible
            ? topic === "E-FORMS" || topic === "MESSAGES WITH PATIENT"
              ? `patient-record__topic-container patient-record__topic-container--${side} patient-record__topic-container--active patient-record__topic-container--bottom`
              : `patient-record__topic-container patient-record__topic-container--${side} patient-record__topic-container--active`
            : `patient-record__topic-container patient-record__topic-container--${side} `
        }
        ref={containerRef}
      >
        {/* DEMOGRAPHICS */}
        {topic === "DEMOGRAPHICS" && (
          <DemographicsContent patientInfos={patientInfos} />
        )}
        {topic === "DEMOGRAPHICS" && popUpVisible && (
          <FakeWindow
            title={`DEMOGRAPHICS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <DemographicsPU
              patientInfos={patientInfos}
              setPatientInfos={setPatientInfos}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* MEDICAL HISTORY */}
        {topic === "MEDICAL HISTORY" && (
          <MedHistoryContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "MEDICAL HISTORY" && popUpVisible && (
          <FakeWindow
            title={`MEDICAL HISTORY of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <MedHistoryPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* FAMILY HISTORY */}
        {topic === "FAMILY HISTORY" && (
          <FamHistoryContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "FAMILY HISTORY" && popUpVisible && (
          <FakeWindow
            title={`FAMILY HISTORY of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <FamHistoryPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              setPopUpVisible={setPopUpVisible}
              isLoading={isLoading}
              errMsg={errMsg}
            />
          </FakeWindow>
        )}
        {/*******************/}
        {/* RELATIONSHIPS */}
        {topic === "RELATIONSHIPS" && (
          <RelationshipsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "RELATIONSHIPS" && popUpVisible && (
          <FakeWindow
            title={`RELATIONSHIPS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <RelationshipsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}
        {/* FAMILY DOCTORS */}
        {topic === "FAMILY DOCTORS/SPECIALISTS" && (
          <DoctorsContent datas={datas} isLoading={isLoading} errMsg={errMsg} />
        )}
        {topic === "FAMILY DOCTORS/SPECIALISTS" && popUpVisible && (
          <FakeWindow
            title={`FAMILY DOCTORS & SPECIALISTS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1400}
            height={600}
            x={(window.innerWidth - 1400) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <FamilyDoctorsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* RISK FACTORS */}
        {topic === "RISK FACTORS/PREVENTION" && (
          <RiskContent datas={datas} isLoading={isLoading} errMsg={errMsg} />
        )}
        {topic === "RISK FACTORS/PREVENTION" && popUpVisible && (
          <FakeWindow
            title={`RISK FACTORS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <RiskPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* MEDICATIONS */}
        {topic === "MEDICATIONS" && (
          <MedicationsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "MEDICATIONS" && popUpVisible && (
          <FakeWindow
            title={`MEDICATIONS for ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1400}
            height={600}
            x={(window.innerWidth - 1400) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <MedicationsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
              patientInfos={patientInfos}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* PHARMACIES */}
        {topic === "PHARMACIES" && (
          <PharmaciesContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "PHARMACIES" && popUpVisible && (
          <FakeWindow
            title={`PHARMACIES of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1400}
            height={600}
            x={(window.innerWidth - 1400) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <PharmaciesPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* MEASUREMENTS */}
        {topic === "MEASUREMENTS" && (
          <MeasurementsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "MEASUREMENTS" && popUpVisible && (
          <FakeWindow
            title={`MEASUREMENTS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1200}
            height={600}
            x={(window.innerWidth - 1200) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <MeasurementsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}
        {/*E-FORMS */}
        {topic === "E-FORMS" && (
          <EformsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
            showDocument={showDocument}
          />
        )}
        {topic === "E-FORMS" && popUpVisible && (
          <FakeWindow
            title={`ELECTRONIC FORMS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <EformsPU
              patientInfos={patientInfos}
              patientId={patientId}
              showDocument={showDocument}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}
        {/* SOCIAL HISTORY */}
        {topic === "SOCIAL HISTORY" && (
          <SocHistoryContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "SOCIAL HISTORY" && popUpVisible && (
          <FakeWindow
            title={`SOCIAL HISTORY of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={500}
            height={450}
            x={(window.innerWidth - 500) / 2}
            y={(window.innerHeight - 450) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <SocHistoryPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* REMINDERS */}
        {topic === "REMINDERS/ALERTS" && (
          <RemindersContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "REMINDERS/ALERTS" && popUpVisible && (
          <FakeWindow
            title={`REMINDERS & ALERTS concerning ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <RemindersPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* PREGNANCIES */}
        {topic === "PREGNANCIES" && (
          <PregnanciesContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "PREGNANCIES" && popUpVisible && (
          <FakeWindow
            title={`PREGNANCIES of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={900}
            height={600}
            x={(window.innerWidth - 900) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <PregnanciesPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* ALLERGIES */}
        {topic === "ALLERGIES" && (
          <AllergiesContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "ALLERGIES" && popUpVisible && (
          <FakeWindow
            title={`ALLERGIES of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <AllergiesPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* CONCERNS */}
        {topic === "ONGOING CONCERNS" && (
          <ConcernsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "ONGOING CONCERNS" && popUpVisible && (
          <FakeWindow
            title={`ONGOING CONCERNS about ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={800}
            height={600}
            x={(window.innerWidth - 800) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <ConcernsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* DOCUMENTS */}
        {topic === "DOCUMENTS" && (
          <DocumentsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
            showDocument={showDocument}
          />
        )}
        {topic === "DOCUMENTS" && popUpVisible && (
          <FakeWindow
            title={`DOCUMENTS about ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1200}
            height={600}
            x={(window.innerWidth - 1200) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <DocumentsPU
              patientId={patientId}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              showDocument={showDocument}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* VACCINES */}
        {topic === "VACCINES" && <VaccinesContent />}
        {topic === "VACCINES" && popUpVisible && (
          <FakeWindow
            title={`VACCINES of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1400}
            height={700}
            x={(window.innerWidth - 1400) / 2}
            y={(window.innerHeight - 700) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <VaccinesPU
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
              patientInfos={patientInfos}
            />
          </FakeWindow>
        )}
        {/*******************/}

        {/* APPOINTMENTS */}
        {topic === "APPOINTMENTS" && (
          <AppointmentsContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {topic === "APPOINTMENTS" && popUpVisible && (
          <FakeWindow
            title={`APPOINTMENTS of ${patientIdToName(
              clinic.patientsInfos,
              patientId
            )}`}
            width={1300}
            height={600}
            x={(window.innerWidth - 1300) / 2}
            y={(window.innerHeight - 600) / 2}
            color={backgroundColor}
            setPopUpVisible={setPopUpVisible}
          >
            <AppointmentsPU
              patientId={patientId}
              patientInfos={patientInfos}
              datas={datas}
              setDatas={setDatas}
              isLoading={isLoading}
              errMsg={errMsg}
              setPopUpVisible={setPopUpVisible}
            />
          </FakeWindow>
        )}
        {/*******************/}
        {/* MESSAGES ABOUT PATIENT */}
        {topic === "MESSAGES ABOUT PATIENT" && (
          <MessagesContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {/*******************/}
        {/* MESSAGES WITH PATIENT */}
        {topic === "MESSAGES WITH PATIENT" && (
          <MessagesExternalContent
            datas={datas}
            isLoading={isLoading}
            errMsg={errMsg}
          />
        )}
        {/*******************/}
      </div>
    </div>
  );
};

export default PatientTopic;
