const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const STANDARD_VALUES = new Set(["5", "6", "7", "8", "9", "10"]);
const COURSE_VALUES = new Set([
  "SSC",
  "HSC Foundation",
  "JEE Foundation",
  "NEET Foundation",
]);
const GENDER_VALUES = new Set(["Female", "Male", "Other"]);

const STUDENT_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "standard",
  "course",
  "guardianName",
  "guardianPhone",
  "address",
]);

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function addLengthError(errors, value, field, label, min, max) {
  if (value.length < min || value.length > max) {
    errors[field] = `${label} must be between ${min} and ${max} characters.`;
  }
}

function isValidDateOfBirth(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    date < new Date(new Date().toISOString().slice(0, 10))
  );
}

function validateStudentInput(input) {
  const errors = {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      value: null,
      errors: { body: "Request body must be a JSON object." },
    };
  }

  for (const field of Object.keys(input)) {
    if (!STUDENT_FIELDS.has(field)) {
      errors[field] = "This field is not supported.";
    }
  }

  const value = {
    firstName: asTrimmedString(input.firstName),
    lastName: asTrimmedString(input.lastName),
    email: asTrimmedString(input.email).toLowerCase(),
    phone: asTrimmedString(input.phone),
    dateOfBirth: asTrimmedString(input.dateOfBirth),
    gender: asTrimmedString(input.gender),
    standard: asTrimmedString(input.standard),
    course: asTrimmedString(input.course),
    guardianName: asTrimmedString(input.guardianName),
    guardianPhone: asTrimmedString(input.guardianPhone),
    address: asTrimmedString(input.address),
  };

  addLengthError(errors, value.firstName, "firstName", "First name", 2, 50);
  addLengthError(errors, value.lastName, "lastName", "Last name", 2, 50);
  addLengthError(errors, value.guardianName, "guardianName", "Guardian name", 2, 80);
  addLengthError(errors, value.address, "address", "Address", 5, 300);

  if (value.email && (!EMAIL_PATTERN.test(value.email) || value.email.length > 254)) {
    errors.email = "Enter a valid email address (maximum 254 characters).";
  } else if (!value.email) {
    delete value.email;
  }

  if (!PHONE_PATTERN.test(value.phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!PHONE_PATTERN.test(value.guardianPhone)) {
    errors.guardianPhone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!isValidDateOfBirth(value.dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date of birth in the past (YYYY-MM-DD).";
  }
  if (!GENDER_VALUES.has(value.gender)) {
    errors.gender = "Choose Female, Male, or Other.";
  }
  if (!STANDARD_VALUES.has(value.standard)) {
    errors.standard = "Choose a standard from 5 to 10.";
  }
  if (!COURSE_VALUES.has(value.course)) {
    errors.course = "Choose a supported YPS Academy course.";
  }

  return { value, errors };
}

module.exports = { validateStudentInput };
