//TODO: dummy boilerplate that we'll overwrite later

// give this a testy lookin filename, like
// test/foo.js or ./lib/foo.test.js

import { t } from "tap";
import { greet } from "../src/index.ts";

t.test("greet", async (t) => {
  const results = t.capture(console, "log");
  greet("hello");
  t.match(results(), [{ args: ["hello"], returned: undefined }]); // don't have to call t.end(), it'll just end when the
  // async stuff is all resolved.
});
