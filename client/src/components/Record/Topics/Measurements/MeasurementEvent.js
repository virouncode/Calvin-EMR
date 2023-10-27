import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  deletePatientRecord,
  postPatientRecord,
  putPatientRecord,
} from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import {
  bodyMassIndex,
  bodySurfaceArea,
  cmToFeet,
  feetToCm,
  kgToLbs,
  lbsToKg,
} from "../../../../utils/measurements";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { measurementSchema } from "../../../../validation/measurementValidation";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";

const MeasurementEvent = ({ event, editCounter, setErrMsgPost }) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [eventInfos, setEventInfos] = useState(null);

  useEffect(() => {
    setEventInfos(event);
  }, [event]);

  //HANDLERS
  const handleEditClick = (e) => {
    editCounter.current += 1;
    setErrMsgPost("");
    setEditVisible((v) => !v);
  };

  const handleDeleteClick = async (e) => {
    setErrMsgPost("");
    if (
      await confirmAlert({
        content: "Do you really want to delete this item ?",
      })
    ) {
      try {
        await deletePatientRecord(
          "/measurements",
          event.id,
          auth.authToken,
          socket,
          "MEASUREMENTS"
        );
        toast.success("Deleted successfully", { containerId: "B" });
      } catch (err) {
        toast.error(`Error unable to delete measurement: ${err.message}`, {
          containerId: "B",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDatas = { ...eventInfos };
    //Validation
    const formDatasForValidation = { ...eventInfos };
    delete formDatasForValidation.patient_id;
    for (const key in formDatasForValidation) {
      if (isNaN(formDatasForValidation[key]) || !formDatasForValidation[key]) {
        formDatasForValidation[key] = 0;
      }
    }
    try {
      await measurementSchema.validate(formDatasForValidation);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    if (!Object.values(formDatasForValidation).some((v) => v !== 0)) {
      setErrMsgPost("Please fill at least one field");
      return;
    }
    //Submission
    try {
      await putPatientRecord(
        "/measurements",
        event.id,
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "MEASUREMENTS"
      );
      editCounter.current -= 1;
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to update measurement: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  const handleChange = async (e) => {
    setErrMsgPost(false);
    const name = e.target.name;
    const value = e.target.value;
    setEventInfos({ ...eventInfos, [name]: value });

    switch (name) {
      case "height_cm": {
        const heightFeet = cmToFeet(value);
        if (eventInfos.weight_kg) {
          const bmi = bodyMassIndex(value, eventInfos.weight_kg);
          const bsa = bodySurfaceArea(value, eventInfos.weight_kg);
          setEventInfos({
            ...eventInfos,
            height_cm: value,
            height_feet: heightFeet,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setEventInfos({
            ...eventInfos,
            height_cm: value,
            height_feet: heightFeet,
          });
        }
        break;
      }
      case "height_feet": {
        const heightCm = feetToCm(value);
        if (eventInfos.weight_kg) {
          const bmi = bodyMassIndex(heightCm, eventInfos.weight_kg);
          const bsa = bodySurfaceArea(heightCm, eventInfos.weight_kg);
          setEventInfos({
            ...eventInfos,
            height_cm: heightCm,
            height_feet: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setEventInfos({
            ...eventInfos,
            height_cm: heightCm,
            height_feet: value,
          });
        }
        break;
      }
      case "weight_kg": {
        const weightLbs = kgToLbs(value);
        if (eventInfos.height_cm) {
          const bmi = bodyMassIndex(eventInfos.height_cm, value);
          const bsa = bodySurfaceArea(eventInfos.height_cm, value);
          setEventInfos({
            ...eventInfos,
            weight_kg: value,
            weight_lbs: weightLbs,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setEventInfos({
            ...eventInfos,
            weight_kg: value,
            weight_lbs: weightLbs,
          });
        }
        break;
      }
      case "weight_lbs": {
        const weightKg = lbsToKg(value);
        if (eventInfos.height_cm) {
          const bmi = bodyMassIndex(eventInfos.height_cm, weightKg);
          const bsa = bodySurfaceArea(eventInfos.height_cm, weightKg);
          setEventInfos({
            ...eventInfos,
            weight_kg: weightKg,
            weight_lbs: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setEventInfos({
            ...eventInfos,
            weight_kg: weightKg,
            weight_lbs: value,
          });
        }
        break;
      }
      default: {
        setEventInfos({ ...eventInfos, [name]: value });
        break;
      }
    }
  };

  const handleAddToProgressNotes = async () => {
    const progressNote = {
      patient_id: event.patient_id,
      object: "Measurements",
      body: `Patient Measurements
      
      Height(cm): ${eventInfos.height_cm}
      Height(feet): ${eventInfos.height_feet}
      Weight(kg): ${eventInfos.weight_kg}
      Weight(lbs): ${eventInfos.weight_lbs}
      Waist Circumference(cm): ${eventInfos.waist_circumference}
      Body Mass Index(kg/m2): ${eventInfos.body_mass_index}
      Body Surface Area(m2): ${eventInfos.body_surface_area}
      Systolic(mmHg): ${eventInfos.blood_pressure_systolic}
      Diastolic(mmHg): ${eventInfos.blood_pressure_diastolic}`,
      version_nbr: 1,
      attachments_ids: [],
    };
    try {
      await postPatientRecord(
        "/progress_notes",
        user.id,
        auth.authToken,
        progressNote,
        socket,
        "PROGRESS NOTES"
      );
      toast.success("Measurements successfully added to progress notes", {
        containerId: "B",
      });
    } catch (err) {
      toast.success(
        `Unable to add measurements to progress notes: ${err.message}`,
        { containerId: "B" }
      );
    }
  };

  return (
    eventInfos && (
      <tr className="measurements__event">
        <td>
          {editVisible ? (
            <input
              type="text"
              name="height_cm"
              value={eventInfos.height_cm || ""} //if 0 then ""
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.height_cm || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="height_feet"
              value={eventInfos.height_feet || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.height_feet || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="weight_kg"
              value={eventInfos.weight_kg || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.weight_kg || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="weight_lbs"
              value={eventInfos.weight_lbs || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.weight_lbs || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="waist_circumference"
              value={eventInfos.waist_circumference || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.waist_circumference || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              readOnly
              value={eventInfos.body_mass_index || ""}
              autoComplete="off"
            />
          ) : (
            eventInfos.body_mass_index || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              readOnly
              value={eventInfos.body_surface_area || ""}
              autoComplete="off"
            />
          ) : (
            eventInfos.body_surface_area || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="blood_pressure_systolic"
              value={eventInfos.blood_pressure_systolic || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.blood_pressure_systolic || ""
          )}
        </td>
        <td>
          {editVisible ? (
            <input
              type="text"
              name="blood_pressure_diastolic"
              value={eventInfos.blood_pressure_diastolic || ""}
              onChange={handleChange}
              autoComplete="off"
            />
          ) : (
            eventInfos.blood_pressure_diastolic || ""
          )}
        </td>
        <td>
          <em>
            {staffIdToTitleAndName(
              clinic.staffInfos,
              eventInfos.created_by_id,
              true
            )}
          </em>{" "}
        </td>
        <td>
          <em>{toLocalDate(eventInfos.date_created)}</em>
        </td>
        <td>
          <div className="measurements__event-btn-container">
            {!editVisible ? (
              <button onClick={handleEditClick}>Edit</button>
            ) : (
              <input type="submit" value="Save" onClick={handleSubmit} />
            )}
            <button onClick={handleDeleteClick}>Delete</button>
            <button onClick={handleAddToProgressNotes}>
              Add to progress notes
            </button>
          </div>
        </td>
      </tr>
    )
  );
};

export default MeasurementEvent;
