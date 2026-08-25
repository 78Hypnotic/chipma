import assert from "node:assert/strict";
import test from "node:test";

import { hasAdminRole } from "../app/lib/admin-role.ts";

test("authorizes admins only from signed app_metadata claims", () => {
  assert.equal(hasAdminRole({ sub: "user-1", app_metadata: { role: "admin" } }), true);
  assert.equal(hasAdminRole({ sub: "user-1", user_metadata: { role: "admin" } }), false);
  assert.equal(hasAdminRole({ sub: "user-1", app_metadata: { role: "editor" } }), false);
  assert.equal(hasAdminRole({ app_metadata: { role: "admin" } }), false);
});
