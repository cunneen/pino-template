//TODO: dummy boilerplate that we'll overwrite later

// give this a testy lookin filename, like
// test/foo.js or ./lib/foo.test.js

import { pino } from "pino";
import { once, sink } from "pino-test";
import { t } from "tap";
import { greet } from "../src/index.ts";

t.test("greet", async (t) => {
  const results = t.capture(console, "log");
  greet("hello");
  t.match(results(), [{ args: ["hello"], returned: undefined }]);
  // don't have to call t.end(), it'll just end when the
  // async stuff is all resolved.
});

t.test("pino", async (t) => {
  const stream = sink();
  const logger = pino(stream);
  logger.info("hello world");

  const expected = { msg: "hello world", level: 30 };
  await once(stream, expected);

  logger.info("hello world 1");

  await once(stream, (log: Record<string, unknown>) => {
    t.equal(log.msg, "hello world 1");
  });
});
