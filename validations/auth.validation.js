import * as yup from "yup";

export const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required(),
  password: yup.string().min(6, "Min 6 chars").required(),
  age: yup.number().required("Age required"),
  dob: yup.string().required("DOB required"),
  contact: yup.string().min(10, "Invalid contact").required()
});

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required()
});
