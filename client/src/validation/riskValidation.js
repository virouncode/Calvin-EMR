import * as yup from "yup";

export const riskSchema = yup.object({
  description: yup
    .string()
    .required("Risk factor description field is required"),
});
