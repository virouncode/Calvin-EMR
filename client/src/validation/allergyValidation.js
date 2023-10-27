import * as yup from "yup";

export const allergySchema = yup.object({
  allergy: yup.string().required("Allergy description field is required"),
});
