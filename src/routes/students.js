const express = require("express");
const { validateStudentInput } = require("../validators/student");

function createStudentsRouter(Student) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { value, errors } = validateStudentInput(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          message: "Student details are invalid.",
          details: errors,
        },
      });
    }

    const student = await Student.create(value);
    return res.status(201).json({ data: student });
  });

  return router;
}

module.exports = { createStudentsRouter };
