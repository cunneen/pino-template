import { readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import pino, { type Logger, type TransportPipelineOptions } from "pino";
import { once, sink } from "pino-test";
import { t } from "tap";
import type { PinoTransportItemType } from "../src/index.mts";

const __dirname = import.meta.dirname;

// const templateTransportPath = path.resolve(path.join(__dirname, "../dist/index.js"))
const templateTransportPath = path.resolve(
  path.join(__dirname, "../dist/index.mjs"),
);

t.test("pino - vanilla", async (t) => {
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

t.test("pino - with transport", async (c) => {
  // create a file within tapjs' scope which will be automatically cleaned up
  const dir = c.testdir({
    // strings or buffers are files
    "templateTransport.txt": "",
  });
  const filepath = path.join(dir, "templateTransport.txt");

  // create our template transformer transport
  const pinoTemplateConfig = {
    target: templateTransportPath,
    options: {
      template: `<%
      const {context, data} = it; 
    %><%= 
      JSON.stringify({...data, "level":context?.levelMapping?.[data.level] ?? data.level}) 
    %>`,
      templateContext: { levelMapping: pino.levels.labels },
    },
    level: "info",
  };
  // create a file transport that will output to our temporary file
  const pinoFileConfig: PinoTransportItemType = {
    target: "pino/file",
    level: "info",
    options: {
      destination: filepath,
      sync: true,
    },
  } as PinoTransportItemType;
  const pinoTransportTargets = {
    pipeline: [pinoTemplateConfig, pinoFileConfig],
    sync: true,
  } as TransportPipelineOptions;

  const transport = pino.transport(pinoTransportTargets);
  const logger: Logger = pino(
    {
      level: "info",
    },
    transport,
  ) as unknown as Logger;

  // log a message
  logger.info("hello again");

  // get a promisified version of pino's transport.flush(), then invoke it.
  const flushPromisify = promisify(transport.flush);
  await flushPromisify.call(transport);

  // read the logs that have been created
  const fileContents = readFileSync(filepath, { encoding: "utf8" });
  const fileContentsLines = fileContents.split(/\n/);

  // assertions for the log file contents
  c.equal(
    fileContentsLines.length,
    2,
    "Should be only one log line and one empty line",
  );
  c.match(
    fileContentsLines[0],
    /^\{.+\}/,
    "first line should start and end with curly braces",
  );
  c.match(fileContentsLines[1], /^$/, "second line should be empty");
  if (fileContentsLines.length === 2) {
    const fileContentsParsed = JSON.parse(fileContents);
    c.equal(fileContentsParsed.level, "info");
  }
});

t.test("pino - with transport - no options", async (c) => {
  // create a file within tapjs' scope which will be automatically cleaned up
  const dir = c.testdir({
    // strings or buffers are files
    "templateTransport.txt": "",
  });
  const filepath = path.join(dir, "templateTransport.txt");

  // create our template transformer transport
  const pinoTemplateConfig = {
    target: templateTransportPath,
    level: "info",
  };
  // create a file transport that will output to our temporary file
  const pinoFileConfig: PinoTransportItemType = {
    target: "pino/file",
    level: "info",
    options: {
      destination: filepath,
      sync: true,
    },
  } as PinoTransportItemType;
  const pinoTransportTargets = {
    pipeline: [pinoTemplateConfig, pinoFileConfig],
    sync: true,
  } as TransportPipelineOptions;

  const transport = pino.transport(pinoTransportTargets);
  const logger: Logger = pino(
    {
      level: "info",
    },
    transport,
  ) as unknown as Logger;

  // log a message
  logger.info("hello again");

  // get a promisified version of pino's transport.flush(), then invoke it.
  const flushPromisify = promisify(transport.flush);
  await flushPromisify.call(transport);

  // read the logs that have been created
  const fileContents = readFileSync(filepath, { encoding: "utf8" });
  const fileContentsLines = fileContents.split(/\n/);

  // assertions for the log file contents
  c.equal(
    fileContentsLines.length,
    2,
    "Should be only one log line and one empty line",
  );
  c.match(
    fileContentsLines[0],
    /^\{.+\}/,
    "first line should start and end with curly braces",
  );
  c.match(fileContentsLines[1], /^$/, "second line should be empty");
  if (fileContentsLines.length === 2) {
    const fileContentsParsed = JSON.parse(fileContents);
    t.equal(fileContentsParsed.level, 30, "Expected level to be 30");
    t.equal(
      fileContentsParsed.msg,
      "hello again",
      "Expected msg to be 'hello again'",
    );
  }
});

t.test("pino - with transport - Eta template throws errors", async (c) => {
  // create a file within tapjs' scope which will be automatically cleaned up
  const dir = c.testdir({
    // strings or buffers are files
    "templateTransport.txt": "",
  });
  const filepath = path.join(dir, "templateTransport.txt");

  // create our template transformer transport
  const pinoTemplateConfig = {
    target: templateTransportPath,
    level: "info",
    options: {
      template: `<%
      throw new Error('Dummy Error')
    %>`,
      templateContext: { levelMapping: pino.levels.labels },
    },
  };
  // create a file transport that will output to our temporary file
  const pinoFileConfig: PinoTransportItemType = {
    target: "pino/file",
    level: "info",
    options: {
      destination: filepath,
      sync: true,
    },
  } as PinoTransportItemType;
  const pinoTransportTargets = {
    pipeline: [pinoTemplateConfig, pinoFileConfig],
    sync: true,
  } as TransportPipelineOptions;

  const transport = pino.transport(pinoTransportTargets);
  const logger: Logger = pino(
    {
      level: "info",
    },
    transport,
  ) as unknown as Logger;

  // log a message
  logger.info("hello again");

  // get a promisified version of pino's transport.flush(), then invoke it.
  const flushPromisify = promisify(transport.flush);
  await flushPromisify.call(transport);

  // read the logs that have been created
  const fileContents = readFileSync(filepath, { encoding: "utf8" });
  const fileContentsLines = fileContents.split(/\n/);

  // assertions for the log file contents
  c.equal(
    fileContentsLines.length,
    2,
    "Should be only one log line and one empty line",
  );
  c.match(
    fileContentsLines[0],
    /^\{.+\}/,
    "first line should start and end with curly braces",
  );
  c.match(fileContentsLines[1], /^$/, "second line should be empty");
  if (fileContentsLines.length === 2) {
    const fileContentsParsed = JSON.parse(fileContents);
    t.equal(fileContentsParsed.level, 30, "Expected level to be 30");
    t.equal(
      fileContentsParsed.msg,
      "hello again",
      "Expected msg to be 'hello again'",
    );
  }
});

t.test("pino - Invalid Eta template throws errors", async (c) => {
  // create a file within tapjs' scope which will be automatically cleaned up
  const dir = c.testdir({
    // strings or buffers are files
    "templateTransport.txt": "",
  });
  const filepath = path.join(dir, "templateTransport.txt");

  // create our template transformer transport
  const pinoTemplateConfig = {
    target: templateTransportPath,
    level: "info",
    options: {
      template: `THIS IS NOT A TEMPLATE`,
      templateContext: { levelMapping: pino.levels.labels },
    },
  };
  // create a file transport that will output to our temporary file
  const pinoFileConfig: PinoTransportItemType = {
    target: "pino/file",
    level: "info",
    options: {
      destination: filepath,
      sync: true,
    },
  } as PinoTransportItemType;
  const pinoTransportTargets = {
    pipeline: [pinoTemplateConfig, pinoFileConfig],
    sync: true,
  } as TransportPipelineOptions;

  try {
    const transport = pino.transport(pinoTransportTargets);
    const logger: Logger = pino(
      {
        level: "info",
      },
      transport,
    ) as unknown as Logger;

    // log a message
    logger.info("hello again");

    // get a promisified version of pino's transport.flush(), then invoke it.
    const flushPromisify = promisify(transport.flush);
    await flushPromisify.call(transport);
  } catch (err: unknown) {
    console.error(err);
  }
});
