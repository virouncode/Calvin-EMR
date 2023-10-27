import React, { useState } from "react";
import { toast } from "react-toastify";
import { postPatientRecord } from "../../../../api/fetchRecords";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import { firstLetterUpper } from "../../../../utils/firstLetterUpper";
import { toISOStringNoMs, toLocalDate } from "../../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";
import { pharmacySchema } from "../../../../validation/pharmacyValidation";
import CountriesList from "../../../Lists/CountriesList";

const PharmacyForm = ({
  setPharmaciesList,
  setAddNew,
  patientId,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, clinic, user } = useAuth();
  const [formDatas, setFormDatas] = useState({
    name: "",
    patients: [{ patients_id: patientId }],
    address: "",
    province_state: "",
    postal_code: "",
    city: "",
    country: "",
    phone: "",
    fax: "",
    email: "",
  });

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    const name = e.target.name;
    const value = e.target.value;
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const datasToPost = {
      ...formDatas,
      name: firstLetterUpper(formDatas.name),
      address: firstLetterUpper(formDatas.address),
      province_state: firstLetterUpper(formDatas.province_state),
      email: formDatas.email.toLowerCase(),
      city: firstLetterUpper(formDatas.city),
    };
    //Validation
    try {
      await pharmacySchema.validate(datasToPost);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }
    //Submission
    try {
      await postPatientRecord(
        "/pharmacies",
        user.id,
        auth.authToken,
        datasToPost
      );
      setAddNew(false);
      const response = await axiosXano.get("/all_pharmacies", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      setPharmaciesList(response.data);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(`Error: unable to add pharmacy: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <tr className="pharmacies__form">
      <td>
        <input
          name="name"
          type="text"
          value={formDatas.name}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="address"
          type="text"
          value={formDatas.address}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="province_state"
          type="text"
          value={formDatas.province_state}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="postal_code"
          type="text"
          value={formDatas.postal_code}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="city"
          type="text"
          value={formDatas.city}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <CountriesList
          handleChange={handleChange}
          name="country"
          value={formDatas.country}
        />
      </td>
      <td>
        <input
          name="phone"
          type="text"
          value={formDatas.phone}
          onChange={handleChange}
        />
      </td>
      <td>
        <input
          name="fax"
          type="text"
          value={formDatas.fax}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <input
          name="email"
          type="text"
          value={formDatas.email}
          onChange={handleChange}
          autoComplete="off"
        />
      </td>
      <td>
        <em>{staffIdToTitleAndName(clinic.staffInfos, user.id, true)}</em>
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

export default PharmacyForm;
