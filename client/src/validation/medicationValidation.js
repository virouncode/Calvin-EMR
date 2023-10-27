import * as yup from "yup";

export const medicationSchema = yup.object({
  name: yup.string().required("Medication name field is required"),
  route_of_administration: yup
    .string()
    .required("Route of administration field is required"),
  duration: yup.string().required("Duration field is required"),
});
