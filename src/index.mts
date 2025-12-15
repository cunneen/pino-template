/** biome-ignore-all lint/suspicious/noExplicitAny: pino and Eta both specify "any" */
import * as stream from "node:stream";
import { Eta } from "eta";
import type { TransportPipelineOptions, TransportTargetOptions } from "pino";
import build from "pino-abstract-transport";

/** Item type for pino transport config. Copied from pino. */
export type PinoTransportItemType = TransportTargetOptions<Record<string, any>>;
export type PinoTransportPipelineItemType = TransportPipelineOptions<
  Record<string, any>
>;

// === custom pino transport ===
export const pinoTemplateTransport = async (options: Record<string, any>) => {
  // compile options.template into a callable function
  const eta = new Eta({
    autoEscape: false,
    ...(options?.templateOptions ?? {}),
  });
  let compiledTemplateFn: (chunk: any) => string;
  if (options?.template) {
    eta.loadTemplate("@transformEtaTemplate", options.template);
    compiledTemplateFn = (chunk: any) => {
      try {
        return `${eta.render("@transformEtaTemplate", {
          context: { ...(options?.templateContext ?? {}) },
          data: chunk,
        })}\n`;
      } catch (_error) {
        // if there's an issue applying the template, just return the original chunk, stringified
        return `${JSON.stringify(chunk)}\n`;
      }
    };
  } else {
    // no template supplied; if we could do an identity transform that'd be great
    compiledTemplateFn = (chunk: any) => `${JSON.stringify(chunk)}\n`;
  }

  return build(
    (source) => {
      const myTransportStream = new stream.Transform({
        // Make sure autoDestroy is set,
        // this is needed in Node v12 or when using the
        // readable-stream module.
        autoDestroy: true,

        objectMode: true,
        transform(chunk, _encoding, cb) {
          // transforms the payload via the Eta template
          this.push(compiledTemplateFn.call(eta, chunk));
          cb();
        },
      });
      stream.pipeline(source, myTransportStream, (err) => {
        if (err) console.error(err);
      });
      return myTransportStream;
    },
    {
      // This is needed to be able to pipeline transports.
      enablePipelining: true,
      expectPinoConfig: true,
    },
  );
};

export default pinoTemplateTransport;
