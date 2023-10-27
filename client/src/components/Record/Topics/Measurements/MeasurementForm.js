import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
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

const MeasurementForm = ({
  editCounter,
  setAddVisible,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    height_cm: "",
    height_feet: "",
    weight_kg: "",
    weight_lbs: "",
    waist_circumference: "",
    body_surface_area: "",
    body_mass_index: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
  });

  //HANDLERS
  const handleChange = async (e) => {
    setErrMsgPost("");
    const name = e.target.name;
    const value = e.target.value;
    setFormDatas({ ...formDatas, [name]: value });

    switch (name) {
      case "height_cm": {
        const heightFeet = cmToFeet(value);
        if (formDatas.weight_kg) {
          const bmi = bodyMassIndex(value, formDatas.weight_kg);
          const bsa = bodySurfaceArea(value, formDatas.weight_kg);
          setFormDatas({
            ...formDatas,
            height_cm: value,
            height_feet: heightFeet,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            height_cm: value,
            height_feet: heightFeet,
          });
        }
        break;
      }
      case "height_feet": {
        const heightCm = feetToCm(value);
        if (formDatas.weight_kg) {
          const bmi = bodyMassIndex(heightCm, formDatas.weight_kg);
          const bsa = bodySurfaceArea(heightCm, formDatas.weight_kg);
          setFormDatas({
            ...formDatas,
            height_cm: heightCm,
            height_feet: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            height_cm: heightCm,
            height_feet: value,
          });
        }
        break;
      }
      case "weight_kg": {
        const weightLbs = kgToLbs(value);
        if (formDatas.height_cm) {
          const bmi = bodyMassIndex(formDatas.height_cm, value);
          const bsa = bodySurfaceArea(formDatas.height_cm, value);
          setFormDatas({
            ...formDatas,
            weight_kg: value,
            weight_lbs: weightLbs,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            weight_kg: value,
            weight_lbs: weightLbs,
          });
        }
        break;
      }
      case "weight_lbs": {
        const weightKg = lbsToKg(value);
        if (formDatas.height_cm) {
          const bmi = bodyMassIndex(formDatas.height_cm, weightKg);
          const bsa = bodySurfaceArea(formDatas.height_cm, weightKg);
          setFormDatas({
            ...formDatas,
            weight_kg: weightKg,
            weight_lbs: value,
            body_mass_index: bmi,
            body_surface_area: bsa,
          });
        } else {
          setFormDatas({
            ...formDatas,
            weight_kg: weightKg,
            weight_lbs: value,
          });
        }
        break;
      }
      default: {
        setFormDatas({ ...formDatas, [name]: value });
        break;
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    const formDatasForValidation = { ...formDatas };
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

    try {
      await postPatientRecord(
        "/measurements",
        user.id,
        auth.authToken,
        formDatas,
        socket,
        "MEASUREMENTS"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error unable to save measurement: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="measurements__form">
      <td>
        <input
          name="height_cm"
          type="text"
          value={formDatas.height_cm || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="height_feet"
          type="text"
          value={formDatas.height_feet || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="weight_kg"
          type="text"
          value={formDatas.weight_kg || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="weight_lbs"
          type="text"
          value={formDatas.weight_lbs || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="waist_circumference"
          type="text"
          value={formDatas.waist_circumference || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="body_mass_index"
          type="text"
          value={formDatas.body_mass_index || ""}
          readOnly
        />
      </td>
      <td>
        <input
          name="body_surface_area"
          type="text"
          value={formDatas.body_surface_area || ""}
          readOnly
        />
      </td>
      <td>
        <input
          name="blood_pressure_systolic"
          type="text"
          value={formDatas.blood_pressure_systolic || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="blood_pressure_diastolic"
          type="text"
          value={formDatas.blood_pressure_diastolic || ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <em> {staffIdToTitleAndName(clinic.staffInfos, user.id, true)}</em>
      </td>
      <td>
        <em>{toLocalDate(toISOStringNoMs(new Date()))}</em>
      </td>
      <td style={{ textAlign: "center" }}>
        <input type="submit" value="Save" onClick={handleSubmit} />
      </td>
    </tr>
  );
};

export default MeasurementForm;
