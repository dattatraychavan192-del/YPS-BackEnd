const assert = require("node:assert/strict");
const http = require("node:http");
const { test } = require("node:test");
const { createApp } = require("../src/app");

const validStudent = {
  firstName: "Aarav",
  lastName: "Patil",
  email: "AARAV@example.com",
  phone: "9876543210",
  dateOfBirth: "2012-04-18",
  gender: "Male",
  standard: "8",
  course: "SSC",
  guardianName: "Rajesh Patil",
  guardianPhone: "9876543211",
  address: "Udgir, Maharashtra",
};

function postJson(port, body) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/students",
        method: "POST",
        headers: { "content-type": "application/json" },
      },
      (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          try {
            resolve({ status: response.statusCode, body: JSON.parse(responseBody) });
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on("error", reject);
    request.end(body);
  });
}

function preflight(port, origin) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/students",
        method: "OPTIONS",
        headers: {
          origin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({
            status: response.statusCode,
            allowOrigin: response.headers["access-control-allow-origin"],
          });
        });
      },
    );

    request.on("error", reject);
    request.end();
  });
}

async function withServer(app, run) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    await run(server.address().port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function createTestApp(create) {
  return createApp({
    clientOrigin: "http://localhost:4200",
    StudentModel: { create },
  });
}

test("registers a valid student and normalizes their email", async () => {
  const created = [];
  const app = createTestApp(async (value) => {
    const student = { _id: "student-123", ...value };
    created.push(student);
    return student;
  });

  await withServer(app, async (port) => {
    const { status, body } = await postJson(port, JSON.stringify(validStudent));

    assert.equal(status, 201);
    assert.equal(body.data._id, "student-123");
    assert.equal(body.data.email, "aarav@example.com");
    assert.equal(created.length, 1);
  });
});

test("rejects invalid and unsupported student fields", async () => {
  let createCalls = 0;
  const app = createTestApp(async () => {
    createCalls += 1;
    return {};
  });

  await withServer(app, async (port) => {
    const { status, body } = await postJson(
      port,
      JSON.stringify({ ...validStudent, phone: "123", extra: "unexpected" }),
    );

    assert.equal(status, 400);
    assert.equal(body.error.details.phone, "Enter a valid 10-digit Indian mobile number.");
    assert.equal(body.error.details.extra, "This field is not supported.");
    assert.equal(createCalls, 0);
  });
});

test("rejects malformed JSON with a client error", async () => {
  const app = createTestApp(async () => ({}));

  await withServer(app, async (port) => {
    const { status, body } = await postJson(port, '{"firstName":');

    assert.equal(status, 400);
    assert.equal(body.error.message, "Request body contains invalid JSON.");
  });
});

test("allows the configured client origin in CORS preflight requests", async () => {
  const app = createApp({
    clientOrigin: "https://client.example/",
    StudentModel: { create: async () => ({}) },
  });

  await withServer(app, async (port) => {
    const allowed = await preflight(port, "https://client.example");
    const denied = await preflight(port, "https://untrusted.example");

    assert.equal(allowed.status, 204);
    assert.equal(allowed.allowOrigin, "https://client.example");
    assert.equal(denied.allowOrigin, undefined);
  });
});

test("maps duplicate registration keys to a conflict response", async () => {
  const app = createTestApp(async () => {
    const error = new Error("Duplicate key");
    error.code = 11000;
    error.keyPattern = { phone: 1 };
    throw error;
  });

  await withServer(app, async (port) => {
    const { status, body } = await postJson(port, JSON.stringify(validStudent));

    assert.equal(status, 409);
    assert.equal(
      body.error.message,
      "A student with this phone number is already registered.",
    );
  });
});
