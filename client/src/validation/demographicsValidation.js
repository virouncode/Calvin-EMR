import * as yup from "yup";

export const demographicsSchema = yup.object({
  first_name: yup
    .string()
    .required("First Name field is required")
    .matches(/^([^0-9]*)$/, {
      message: "Invalid First Name",
      excludeEmptyString: true,
    }),
  middle_name: yup.string().matches(/^([^0-9]*)$/, {
    message: "Invalid Middle Name",
    excludeEmptyString: true,
  }),
  last_name: yup
    .string()
    .required("First Name field is required")
    .matches(/^([^0-9]*)$/, {
      message: "Invalid Last Name",
      excludeEmptyString: true,
    }),
  date_of_birth: yup
    .number("Invalid Date of Birth")
    .required("Date of birth field is required"),
  cell_phone: yup
    .string()
    .required("Cell Phone field is required")
    .matches(
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      { message: "Invalid Cell Phone number", excludeEmptyString: true }
    ),
  home_phone: yup
    .string()
    .matches(
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      { message: "Invalid Home Phone number", excludeEmptyString: true }
    ),
  preferred_phone: yup
    .string()
    .required("Preferred Phone field is required")
    .matches(
      /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      { message: "Invalid Preferred Phone number", excludeEmptyString: true }
    ),
  address: yup.string().required("Address field is required"),
  postal_code: yup.string().required("Postal Code field is required"),
  city: yup.string().required("City field is required"),
});
