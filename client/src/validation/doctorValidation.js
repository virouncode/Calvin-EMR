import * as yup from "yup";

export const doctorSchema = yup.object({
  name: yup.string().required("Pharmacy name field is required"),
  speciality: yup.string(),
  licence_nbr: yup.string(),
  address: yup.string().required("Pharmacy address field is required"),
  postal_code: yup.string().required("Pharmacy postal code field is required"),
  city: yup.string().required("Pharmacy city field is required"),
  country: yup.string().required("Pharmacy country field is required"),
  phone: yup
    .string()
    .matches(
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      { message: "Invalid Paharmacy phone number", excludeEmptyString: true }
    ),
  fax: yup
    .string()
    .matches(
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      { message: "Invalid Paharmacy fax number", excludeEmptyString: true }
    ),
  email: yup.string().email("Invalid Pharmacy email"),
});
