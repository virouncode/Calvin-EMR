import * as yup from "yup";

export const concernSchema = yup.object({
  description: yup.string().required("Concern description field is required"),
});
