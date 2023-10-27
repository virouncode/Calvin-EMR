import * as yup from "yup";

export const billingFormSchema = yup.object({
  date: yup.string().required("Date field is required"),
  referrer_ohip_nbr: yup.string().required("Provider OHIP number is required"),
  patient_hin: yup.string().required("Patient HIN field is required"),
  diagnosis_code: yup.string().required("Diagnosis code field is required"),
  billing_codes: yup.string().required("Billing code(s) field is required"),
});

export const billingItemSchema = yup.object({
  date: yup.string().required("Date field is required"),
  referrer_ohip_nbr: yup.string().required("Provider OHIP number is required"),
  patient_hin: yup.string().required("Patient HIN field is required"),
  diagnosis_code: yup.string().required("Diagnosis code field is required"),
  billing_code: yup.string().required("Billing code(s) field is required"),
});
