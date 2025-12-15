import path from 'node:path'
import pino from 'pino'

// logs in the format:
//  2025-12-15T13:47:03 INFO - hello world
const templateString = `<%
  // extract the context and this log message
  const {data: d, context: ctx} = it;
  const levelName = (ctx?.[d.level] ?? d.level).toUpperCase(); // e.g. "INFO"
%><%=
  \`\${
    new Date(d.time)
      .toISOString()
      .substring(0, 19)
  } \${
   levelName
  } - \${
   d.msg
  }\`%>`

const logger = pino({
  transport: {
    pipeline: [
      {
        target: path.resolve(import.meta.dirname, '..','dist','index.mjs'),
        options: {
          template: templateString,
          templateContext: pino.levels.labels,
          
        }
      },
      {
        target: 'pino/file',
        options: { destination: 1 }
      }
    ]
  }
})

logger.info('hello world')
