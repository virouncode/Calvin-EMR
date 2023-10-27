import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getPatientRecord,
  postPatientRecord,
} from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { medicationSchema } from "../../../../validation/medicationValidation";

const MedicationForm = ({
  patientId,
  setAddVisible,
  editCounter,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [allergies, setAllergies] = useState([]);
  const [formDatas, setFormDatas] = useState({
    patient_id: patientId,
    name: "",
    active_ingredients: "",
    route_of_administration: "",
    dose: "",
    frequency: "",
    number_of_doses: "",
    duration: "",
    active: true,
  });
  const [errAllergies, setErrAllergies] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAllergies = async () => {
      try {
        const allergiesResults = await getPatientRecord(
          "/allergies",
          patientId,
          auth.authToken,
          abortController
        );
        if (abortController.signal.aborted) return;
        setAllergies(allergiesResults);
      } catch (err) {
        setErrAllergies(
          `Error: unable to fetch patient allergies: ${err.message}`
        );
      }
    };
    fetchAllergies();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken, patientId]);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    if (name === "start") {
      value = value === "" ? null : Date.parse(new Date(value));
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const datasToPost = { ...formDatas, name: formDatas.name.toUpperCase() };
    //Validation
    try {
      await medicationSchema.validate(datasToPost);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await postPatientRecord(
        "/medications",
        user.id,
        auth.authToken,
        datasToPost,
        socket,
        "MEDICATIONS"
      );

      editCounter.current -= 1;
      setAddVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to save medication : ${err.message}`, {
        containerId: "B",
      });
    }
  };

  // const handleMedClick = async (drugName, drugCode) => {
  //   const activeIngredients = await getActiveIngredients(drugCode);
  //   const route = await getRoute(drugCode);
  //   setFormDatas({
  //     ...formDatas,
  //     name: drugName,
  //     active_ingredients: activeIngredients,
  //     route_of_administration: route,
  //   });
  // };

  return (
    <div className="medications-form__container">
      <form>
        <div className="medications-form__allergies">
          <i
            className="fa-solid fa-triangle-exclamation"
            style={{ color: "#ff0000" }}
          ></i>{" "}
          Patient Allergies :{" "}
          {errAllergies
            ? errAllergies
            : allergies && allergies.length > 0
            ? allergies.map(({ allergy }) => allergy).join(", ")
            : "No Allergies"}
        </div>
        <div className="medications-form__row">
          <label>Medication Name</label>
          <input
            name="name"
            type="text"
            value={formDatas.name}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Active Ingredients</label>
          <input
            name="active_ingredients"
            type="text"
            value={formDatas.active_ingredients}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Route of administration</label>
          <input
            name="route_of_administration"
            type="text"
            value={formDatas.route_of_administration}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Dose</label>
          <input
            name="dose"
            type="text"
            value={formDatas.dose}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Frequency</label>
          <input
            name="frequency"
            type="text"
            value={formDatas.frequency}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Number of doses</label>
          <input
            name="number_of_doses"
            type="text"
            value={formDatas.number_of_doses}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <label>Duration of treatment</label>
          <input
            name="duration"
            type="text"
            value={formDatas.duration}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="medications-form__row">
          <button
            type="button"
            onClick={handleSubmit}
            style={{ marginTop: "20px" }}
          >
            Save
          </button>
        </div>
      </form>
      <div className="medications-form__links">
        <h3>Drugs databases</h3>
        <ul>
          <li>
            <a
              href="https://www.pharmacists.ca/products-services/cps-subscriptions/"
              target="_blank"
              rel="noreferrer"
            >
              CPS
            </a>
          </li>
          <li>
            <a
              href="https://www.shoppersdrugmart.ca/en/rx-inventory"
              target="_blank"
              rel="noreferrer"
            >
              Shoppers Drugmart Drug locator and inventory (free)
            </a>
          </li>
          <li>
            <a href="https://www.drugs.com/" target="_blank" rel="noreferrer">
              Drugs.com (free)
            </a>
          </li>
          <li>
            <a
              href="https://www.pdr.net/browse-by-drug-name"
              target="_blank"
              rel="noreferrer"
            >
              PDR/ConnectiveRx (free)
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/drugs"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Drugs database
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/diseases"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Disease database
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/interaction-check"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Interaction check
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/pill-search"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Pill identification
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/medical-calculators"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Calculators
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/tables"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Tables
            </a>
          </li>
          <li>
            <a
              href="https://www.epocrates.com/online/guidelines"
              target="_blank"
              rel="noreferrer"
            >
              Epocrates (free after registration) - Guidelines
            </a>
          </li>
        </ul>
      </div>

      {/* <MedsSearch handleMedClick={handleMedClick} /> */}
    </div>
  );
};

export default MedicationForm;
