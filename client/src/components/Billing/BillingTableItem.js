import { Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosXano from "../../api/xano";
import useAuth from "../../hooks/useAuth";
import { toLocalDate } from "../../utils/formatDates";
import { patientIdToName } from "../../utils/patientIdToName";
import { staffIdToTitleAndName } from "../../utils/staffIdToTitleAndName";
import { billingItemSchema } from "../../validation/billingValidation";
import { confirmAlert } from "../Confirm/ConfirmGlobal";
import FakeWindow from "../Presentation/FakeWindow";
import DiagnosisSearch from "./DiagnosisSearch";
import HinSearch from "./HinSearch";
import ReferringOHIPSearch from "./ReferringOHIPSearch";

const BillingTableItem = ({ billing, setErrMsg }) => {
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [itemInfos, setItemInfos] = useState(null);
  const [diagnosisSearchVisible, setDiagnosisSearchVisible] = useState(false);
  const [hinSearchVisible, setHinSearchVisible] = useState(false);
  const [refOHIPSearchVisible, setRefOHIPSearchVisible] = useState(false);

  useEffect(() => {
    setItemInfos({
      date: billing.date,
      date_created: billing.date_created,
      provider_ohip_nbr:
        billing.provider_ohip_billing_nbr.ohip_billing_nbr.toString(),
      referrer_ohip_nbr: billing.referrer_ohip_billing_nbr.toString(),
      patient_hin: billing.patient_hin.health_insurance_nbr,
      diagnosis_code: billing.diagnosis_code.code.toString(),
      billing_code: billing.billing_code.billing_code,
    });
  }, [
    billing.billing_code.billing_code,
    billing.date,
    billing.date_created,
    billing.diagnosis_code.code,
    billing.patient_hin.health_insurance_nbr,
    billing.provider_ohip_billing_nbr.ohip_billing_nbr,
    billing.referrer_ohip_billing_nbr,
  ]);

  const handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === "date") value = Date.parse(new Date(value));
    setItemInfos({ ...itemInfos, [name]: value });
  };

  const handleEditClick = () => {
    setErrMsg("");
    setEditVisible(true);
  };
  const handleClickDiagnosis = (e, code) => {
    setItemInfos({ ...itemInfos, diagnosis_code: code });
    setDiagnosisSearchVisible(false);
  };
  const handleClickHin = (e, hin) => {
    setItemInfos({ ...itemInfos, patient_hin: hin });
    setHinSearchVisible(false);
  };
  const handleClickRefOHIP = (e, ohip) => {
    setItemInfos({ ...itemInfos, referrer_ohip_nbr: ohip.toString() });
    setRefOHIPSearchVisible(false);
  };

  const handleDuplicateClick = async () => {
    const datasToPost = {
      date: itemInfos.date,
      date_created: Date.now(),
      provider_id: billing.provider_id,
      referrer_ohip_billing_nbr: parseInt(itemInfos.referrer_ohip_nbr),
      patient_id: clinic.patientsInfos.find(
        ({ health_insurance_nbr }) =>
          health_insurance_nbr === itemInfos.patient_hin
      ).id,
      diagnosis_id: (
        await axiosXano.get(
          `/diagnosis_codes_for_code?code=${itemInfos.diagnosis_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data.id,
      billing_code_id: (
        await axiosXano.get(
          `/ohip_fee_schedule?billing_code=${itemInfos.billing_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data.id,
    };
    delete datasToPost.id;
    try {
      const response = await axiosXano.post("/billings", datasToPost, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      const feeSchedule = await axiosXano.get(
        `/ohip_fee_schedule/${datasToPost.billing_code_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const diagnosis = await axiosXano.get(
        `/diagnosis_codes/${datasToPost.diagnosis_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const datasToEmit = {
        ...response.data,
        provider_ohip_billing_nbr: {
          ohip_billing_nbr: clinic.staffInfos.find(
            ({ id }) => id === datasToPost.provider_id
          ).ohip_billing_nbr,
        },
        patient_hin: {
          health_insurance_nbr: clinic.patientsInfos.find(
            ({ id }) => id === datasToPost.patient_id
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
      setEditVisible(false);
      toast.success(`Billing duplicated successfully`, { containerId: "A" });
    } catch (err) {
      toast.error(`Can't duplicate billing: ${err.message}`, {
        containerId: "A",
      });
    }
  };

  const handleSubmit = async () => {
    //Validation
    try {
      await billingItemSchema.validate(itemInfos);
    } catch (err) {
      setErrMsg(err.message);
      return;
    }

    if (itemInfos.referrer_ohip_nbr.length !== 6) {
      setErrMsg("Referrer OHIP nbr field must be 6-digits");
      return;
    }
    if (
      !clinic.patientsInfos.find(
        ({ health_insurance_nbr }) =>
          health_insurance_nbr === itemInfos.patient_hin
      )
    ) {
      setErrMsg("There is no patient with this HIN in the clinic's database");
      return;
    }
    if (
      (
        await axiosXano.get(
          `/diagnosis_codes_for_code?code=${itemInfos.diagnosis_code}`,
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
    const response = await axiosXano.get(
      `/ohip_fee_schedule?billing_code=${itemInfos.billing_code}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );

    if (response.data === null) {
      setErrMsg(`Billing code ${itemInfos.billing_code} doesn't exists`);
      return;
    }
    //Submission
    const datasToPut = {
      date: itemInfos.date,
      date_created: Date.now(),
      provider_id: billing.provider_id,
      referrer_ohip_billing_nbr: parseInt(itemInfos.referrer_ohip_nbr),
      patient_id: clinic.patientsInfos.find(
        ({ health_insurance_nbr }) =>
          health_insurance_nbr === itemInfos.patient_hin
      ).id,
      diagnosis_id: (
        await axiosXano.get(
          `/diagnosis_codes_for_code?code=${itemInfos.diagnosis_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data.id,
      billing_code_id: (
        await axiosXano.get(
          `/ohip_fee_schedule?billing_code=${itemInfos.billing_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        )
      ).data.id,
    };
    try {
      const response = await axiosXano.put(
        `/billings/${billing.id}`,
        datasToPut,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const feeSchedule = await axiosXano.get(
        `/ohip_fee_schedule/${datasToPut.billing_code_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const diagnosis = await axiosXano.get(
        `/diagnosis_codes/${datasToPut.diagnosis_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      const datasToEmit = {
        ...response.data,
        provider_ohip_billing_nbr: {
          ohip_billing_nbr: clinic.staffInfos.find(
            ({ id }) => id === datasToPut.provider_id
          ).ohip_billing_nbr,
        },
        patient_hin: {
          health_insurance_nbr: clinic.patientsInfos.find(
            ({ id }) => id === datasToPut.patient_id
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
        action: "update",
        content: { id: billing.id, data: datasToEmit },
      });
      setEditVisible(false);
      toast.success(`Billing saved successfully`, { containerId: "A" });
    } catch (err) {
      toast.error(`Can't save billing: ${err.message}`, {
        containerId: "A",
      });
    }
  };

  const handleDeleteClick = async () => {
    if (
      await confirmAlert({
        content: "Do you really want to remove this billing ?",
      })
    ) {
      try {
        await axiosXano.delete(`/billings/${billing.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        });

        socket.emit("message", {
          route: "BILLING",
          action: "delete",
          content: { id: billing.id },
        });
        toast.success(`Billing deleted successfully`, { containerId: "A" });
      } catch (err) {
        toast.error(`Can't delete billing: ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  return (
    itemInfos && (
      <>
        <tr className="billing-table__item">
          <td>
            {editVisible ? (
              <input
                type="date"
                value={toLocalDate(itemInfos.date)}
                name="date"
                onChange={handleChange}
              />
            ) : (
              toLocalDate(billing.date)
            )}
          </td>
          <td>
            <Tooltip
              title={staffIdToTitleAndName(
                clinic.staffInfos,
                billing.provider_id,
                true
              )}
              placement="top-start"
              arrow
            >
              {billing.provider_ohip_billing_nbr.ohip_billing_nbr}
            </Tooltip>
          </td>
          <td style={{ position: "relative" }}>
            {editVisible ? (
              <>
                <input
                  type="text"
                  value={itemInfos.referrer_ohip_nbr}
                  name="referrer_ohip_nbr"
                  onChange={handleChange}
                />
                <i
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                  }}
                  className="fa-solid fa-magnifying-glass"
                  onClick={() => setRefOHIPSearchVisible(true)}
                ></i>
              </>
            ) : (
              billing.referrer_ohip_billing_nbr
            )}
          </td>
          <td style={{ position: "relative" }}>
            {editVisible ? (
              <>
                <input
                  type="text"
                  value={itemInfos.patient_hin}
                  name="patient_hin"
                  onChange={handleChange}
                />
                <i
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                  }}
                  className="fa-solid fa-magnifying-glass"
                  onClick={() => setHinSearchVisible(true)}
                ></i>
              </>
            ) : (
              <Tooltip
                title={patientIdToName(
                  clinic.patientsInfos,
                  billing.patient_id,
                  true
                )}
                placement="top-start"
                arrow
              >
                {billing.patient_hin.health_insurance_nbr}
              </Tooltip>
            )}
          </td>
          <td style={{ position: "relative" }}>
            {editVisible ? (
              <>
                <input
                  type="text"
                  value={itemInfos.diagnosis_code}
                  name="diagnosis_code"
                  onChange={handleChange}
                />
                <i
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    top: "8px",
                  }}
                  className="fa-solid fa-magnifying-glass"
                  onClick={() => setDiagnosisSearchVisible(true)}
                ></i>
              </>
            ) : (
              billing.diagnosis_code.code
            )}
          </td>
          <td>
            {editVisible ? (
              <input
                type="text"
                value={itemInfos.billing_code}
                name="billing_code"
                onChange={handleChange}
              />
            ) : (
              billing.billing_code.billing_code
            )}
          </td>
          <td>
            {(billing.billing_code.provider_fee ||
              billing.billing_code.specialist_fee) / 10000}{" "}
            $
          </td>
          {user.title !== "Secretary" && (
            <td>
              <div className="billing-table__item-btn-container">
                {!editVisible ? (
                  <button onClick={handleEditClick}>Edit</button>
                ) : (
                  <input type="submit" value="Save" onClick={handleSubmit} />
                )}
                <button onClick={handleDeleteClick}>Delete</button>
                <button onClick={handleDuplicateClick}>Duplicate</button>
              </div>
            </td>
          )}
        </tr>
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
      </>
    )
  );
};

export default BillingTableItem;
