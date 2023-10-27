import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { toLocalDate } from "../../utils/formatDates";
import { staffIdToOhip } from "../../utils/staffIdToOhip";
import { billingFormSchema } from "../../validation/billingValidation";
import FakeWindow from "../Presentation/FakeWindow";
import DiagnosisSearch from "./DiagnosisSearch";
import HinSearch from "./HinSearch";
import ReferringOHIPSearch from "./ReferringOHIPSearch";

const BillingForm = ({ setAddVisible, setErrMsg }) => {
  const navigate = useNavigate();
  const { hin, date } = useParams();
  const { auth, user, clinic, socket } = useAuth();
  const [formDatas, setFormDatas] = useState({
    date: toLocalDate(Date.now()),
    provider_ohip_nbr: staffIdToOhip(clinic.staffInfos, user.id),
    referrer_ohip_nbr: "",
    patient_hin: "",
    diagnosis_code: "",
    billing_codes: [],
  });
  const [diagnosisSearchVisible, setDiagnosisSearchVisible] = useState(false);
  const [hinSearchVisible, setHinSearchVisible] = useState(false);
  const [refOHIPSearchVisible, setRefOHIPSearchVisible] = useState(false);

  useEffect(() => {
    if (hin) {
      setFormDatas({
        ...formDatas,
        patient_hin: hin,
        date: toLocalDate(new Date(parseInt(date)).toISOString()),
      });
      navigate("/billing");
    }
  }, [date, formDatas, hin, navigate]);

  const handleChange = (e) => {
    setErrMsg("");
    const name = e.target.name;
    let value = e.target.value;
    if (name === "billing_codes") {
      value = value.split(",").map((billing_code) => billing_code.trim());
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleClickDiagnosis = (e, code) => {
    setFormDatas({ ...formDatas, diagnosis_code: code });
    setDiagnosisSearchVisible(false);
  };
  const handleClickHin = (e, hin) => {
    setFormDatas({ ...formDatas, patient_hin: hin });
    setHinSearchVisible(false);
  };
  const handleClickRefOHIP = (e, ohip) => {
    setFormDatas({ ...formDatas, referrer_ohip_nbr: ohip.toString() });
    setRefOHIPSearchVisible(false);
  };
  const handleCancel = () => {
    setErrMsg("");
    setAddVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Validation
    try {
      await billingFormSchema.validate({
        ...formDatas,
        billing_codes: formDatas.billing_codes.join(","),
      });
    } catch (err) {
      setErrMsg(err.message);
      return;
    }
    if (formDatas.referrer_ohip_nbr.length !== 6) {
      setErrMsg("Referrer OHIP nbr field must be 6-digits");
      return;
    }
    if (
      !clinic.patientsInfos.find(
        ({ health_insurance_nbr }) =>
          health_insurance_nbr === formDatas.patient_hin
      )
    ) {
      setErrMsg("There is no patient with this HIN in the clinic's database");
      return;
    }

    if (
      (
        await axiosXano.get(
          `/diagnosis_codes_for_code?code=${formDatas.diagnosis_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data === null
    ) {
      setErrMsg("There is no existing diagnosis with this code");
      return;
    }
    for (const billing_code of formDatas.billing_codes) {
      const response = await axiosXano.get(
        `/ohip_fee_schedule?billing_code=${billing_code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );

      if (response.data === null) {
        setErrMsg(`Billing code ${billing_code} doesn't exists`);
        return;
      }
    }

    //Submission
    try {
      for (const billing_code of formDatas.billing_codes) {
        const response = await axiosXano.get(
          `/ohip_fee_schedule?billing_code=${billing_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        const billing_code_id = response.data.id;
        const datasToPost = {
          date: Date.parse(new Date(formDatas.date)),
          date_created: Date.now(),
          provider_id: user.id,
          referrer_ohip_billing_nbr: parseInt(formDatas.referrer_ohip_nbr),
          patient_id: clinic.patientsInfos.find(
            ({ health_insurance_nbr }) =>
              health_insurance_nbr === formDatas.patient_hin
          ).id,
          diagnosis_id: (
            await axiosXano.get(
              `/diagnosis_codes_for_code?code=${formDatas.diagnosis_code}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth.authToken}`,
                },
              }
            )
          ).data.id,
          billing_code_id,
        };
        const response2 = await axiosXano.post("/billings", datasToPost, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        });
        const feeSchedule = await axiosXano.get(
          `/ohip_fee_schedule/${response2.data.billing_code_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        const diagnosis = await axiosXano.get(
          `/diagnosis_codes/${response2.data.diagnosis_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        const datasToEmit = {
          ...response2.data,
          provider_ohip_billing_nbr: {
            ohip_billing_nbr: clinic.staffInfos.find(
              ({ id }) => id === response2.data.provider_id
            ).ohip_billing_nbr,
          },
          patient_hin: {
            health_insurance_nbr: clinic.patientsInfos.find(
              ({ id }) => id === response2.data.patient_id
            ).health_insurance_nbr,
          },
          billing_code: {
            billing_code: feeSchedule.data.billing_code,
            provider_fee: feeSchedule.data.provider_fee,
            specialist_fee: feeSchedule.data.specialist_fee,
          },
          diagnosis_code: {
            code: diagnosis.data.code,
          },
        };
        socket.emit("message", {
          route: "BILLING",
          action: "create",
          content: { data: datasToEmit },
        });
      }

      setAddVisible(false);
      toast.success(`Billing(s) saved successfully`, { containerId: "A" });
    } catch (err) {
      toast.error(`Can't save billing(s): ${err.message}`, {
        containerId: "A",
      });
    }
  };
  return (
    <form className="billing-form" onSubmit={handleSubmit}>
      <div className="billing-form__title">Add a new billing</div>
      <div className="billing-form__row">
        <div className="billing-form__item">
          <label htmlFor="">Date</label>
          <input
            type="date"
            value={formDatas.date}
            name="date"
            onChange={handleChange}
          />
        </div>
        <div className="billing-form__item">
          <label htmlFor="">Provider OHIP#</label>
          <input
            type="text"
            value={formDatas.provider_ohip_nbr.toString()}
            name="provider_ohip_nbr"
            readOnly
            style={{ textAlign: "end" }}
          />
        </div>
        <div className="billing-form__item" style={{ position: "relative" }}>
          <label htmlFor="">Referring MD OHIP#</label>
          <input
            type="text"
            value={formDatas.referrer_ohip_nbr}
            name="referrer_ohip_nbr"
            onChange={handleChange}
            autoComplete="off"
            autoFocus
          />
          <i
            style={{ cursor: "pointer", position: "absolute", right: "5px" }}
            className="fa-solid fa-magnifying-glass"
            onClick={() => setRefOHIPSearchVisible(true)}
          ></i>
        </div>
      </div>
      <div className="billing-form__row">
        <div className="billing-form__item" style={{ position: "relative" }}>
          <label htmlFor="">Patient HIN</label>
          <input
            type="text"
            value={formDatas.patient_hin}
            name="patient_hin"
            onChange={handleChange}
            autoComplete="off"
          />
          <i
            style={{ cursor: "pointer", position: "absolute", right: "5px" }}
            className="fa-solid fa-magnifying-glass"
            onClick={() => setHinSearchVisible(true)}
          ></i>
        </div>
        <div className="billing-form__item" style={{ position: "relative" }}>
          <label htmlFor="">Diagnosis code</label>
          <input
            type="text"
            value={formDatas.diagnosis_code}
            name="diagnosis_code"
            onChange={handleChange}
            autoComplete="off"
          />
          <i
            style={{ cursor: "pointer", position: "absolute", right: "5px" }}
            className="fa-solid fa-magnifying-glass"
            onClick={() => setDiagnosisSearchVisible(true)}
          ></i>
        </div>
        <div className="billing-form__item">
          <label htmlFor="">Billing code(s)</label>
          <input
            type="text"
            placeholder="A001,B423,F404,..."
            value={
              formDatas.billing_codes.length > 0
                ? formDatas.billing_codes.join(",")
                : ""
            }
            name="billing_codes"
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>
      <div className="billing-form__btns">
        <input type="submit" />
        <button onClick={handleCancel}>Cancel</button>
      </div>
      {hinSearchVisible && (
        <FakeWindow
          title="HEALTH INSURANCE NUMBER SEARCH"
          width={800}
          height={600}
          x={(window.innerWidth - 800) / 2}
          y={(window.innerHeight - 600) / 2}
          color="#94bae8"
          setPopUpVisible={setHinSearchVisible}
        >
          <HinSearch handleClickHin={handleClickHin} />
        </FakeWindow>
      )}
      {diagnosisSearchVisible && (
        <FakeWindow
          title="DIAGNOSIS CODES SEARCH"
          width={800}
          height={600}
          x={(window.innerWidth - 800) / 2}
          y={(window.innerHeight - 600) / 2}
          color="#94bae8"
          setPopUpVisible={setDiagnosisSearchVisible}
        >
          <DiagnosisSearch handleClickDiagnosis={handleClickDiagnosis} />
        </FakeWindow>
      )}
      {refOHIPSearchVisible && (
        <FakeWindow
          title="REFERRING MD OHIP# SEARCH"
          width={800}
          height={600}
          x={(window.innerWidth - 800) / 2}
          y={(window.innerHeight - 600) / 2}
          color="#94bae8"
          setPopUpVisible={setRefOHIPSearchVisible}
        >
          <ReferringOHIPSearch handleClickRefOHIP={handleClickRefOHIP} />
        </FakeWindow>
      )}
    </form>
  );
};

export default BillingForm;
