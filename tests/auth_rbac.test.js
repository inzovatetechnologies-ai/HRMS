const test = require("node:test");
const assert = require("node:assert");

const COMPANY_DOMAIN = "inzovate-technologies.com";
const INTERNAL_ROLES = ["SUPER_ADMIN", "ADMIN", "HR_MANAGER", "TEAM_LEAD", "EMPLOYEE"];

function validateEmailForRole(email, role) {
  const normalized = email.trim().toLowerCase();
  if (INTERNAL_ROLES.includes(role)) {
    if (!normalized.endsWith(`@${COMPANY_DOMAIN}`)) {
      return { valid: false, error: "Must use @inzovate-technologies.com" };
    }
  }
  return { valid: true };
}

test("Auth Policy: Internal Employee must use @inzovate-technologies.com", () => {
  const valid = validateEmailForRole("ananya.sharma@inzovate-technologies.com", "EMPLOYEE");
  assert.strictEqual(valid.valid, true);

  const invalid = validateEmailForRole("ananya.sharma@gmail.com", "EMPLOYEE");
  assert.strictEqual(invalid.valid, false);
});

test("Auth Policy: Super Admin must use @inzovate-technologies.com", () => {
  const invalid = validateEmailForRole("admin@yahoo.com", "SUPER_ADMIN");
  assert.strictEqual(invalid.valid, false);

  const valid = validateEmailForRole("admin@inzovate-technologies.com", "SUPER_ADMIN");
  assert.strictEqual(valid.valid, true);
});

test("Auth Policy: Intern and Candidate permitted personal email (e.g. Gmail)", () => {
  const intern = validateEmailForRole("rahul.intern@gmail.com", "INTERN");
  assert.strictEqual(intern.valid, true);

  const candidate = validateEmailForRole("arun.candidate@outlook.com", "CANDIDATE");
  assert.strictEqual(candidate.valid, true);
});
