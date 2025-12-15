<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Issues][issues-shield]][issues-url]
[![MIT][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/cunneen/pino-template">
    <img src="./images/pino-template.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">pino-template</h3>

  An [Eta][eta-url] template transport for the pino logging library
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <div>

- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Options](#options)
- [License](#license)
- [Project Link](#project-link)

</div>
</details>




<!-- ABOUT THE PROJECT -->
## About The Project

This is a pipeline transport for the [pino.js][pino.js] logging library, which allows you to transform the logging output by applying an [Eta][eta-url] template.

> For those unfamiliar with Eta, perhaps you've encountered [EJS][EJS-url]. Eta templates are very similar to EJS templates. 

e.g.

**template**

```js
<%
  // extract the context and this log message
  const {data: d, context: ctx} = it;
  const levelName = (ctx?.[d.level] ?? d.level).toUpperCase(); // e.g. "INFO"
%><%=
  // output our formatted log message as a string
  `${
    new Date(d.time)
      .toISOString()
      .substring(0, 19)
  } ${
   levelName
  } - ${
   d.msg
  }`
%>
```

**input**

  ```json
  {"levelName":"info","level":30,"time":1531171074631,"msg":"hello world","pid":657,"hostname":"Davids-MBP-3.fritz.box"}
  ```

**result**

```txt
2018-07-09T21:17:54 - INFO - hello world
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![TypeScript][TypeScript]][Typescript-url]
* [![Node.js][Node.js]][Nodejs-url]
* [![Eta][eta]][eta-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

While this project has no dependencies, it does have the following `peerDependencies`:


* [pino][pino.js]@^10.1.0
  ```sh
  npm install "pino@^10.1.0" --save
  ```
* [eta][eta-url]@^4.0.1
  ```sh
  npm install "eta@^4.0.1" --save
  ```

* **Node versions**:
  This project is tested on Node `24.12.0` .

* **ES Module**: This project is only available as an ES module (a.k.a. "ESM") i.e. it probably won't work in CommonJS, except perhaps using [dynamic import][dynamic-import].

### Installation

1. Ensure you've installed the [prerequisites](#prerequisites) above.
2. Install this NPM package (pino-template):
   ```sh
   npm install pino-template --save
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Combine `pino-template` (this module) as part of a [pino transport pipeline][pino-transport-pipeline].

### Options

| **option**        | **description**                                                                          | **example**                                        |
| ----------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `template`        | The Eta template as a string. Each log message will be available as `it.data`. Required. | `<%= it.data.msg + it.context.foo %>`              |
| `templateContext` | An object which will be made available to the Eta template as `it.context` . Optional.   | `{"foo":"bar"}`                                    |
| `templateOptions` | Options which will be passed to the [Eta constructor][eta-constructor] . Optional.       | `{"debug":false,"cache":false,"autoEscape":false}` |

**Example**

The example below adds an extra `"levelName"` property to each JSON log line i.e. it changes this:

  ```json
  {"level":30,"time":1531171074631,"msg":"hello world","pid":657,"hostname":"Davids-MBP-3.fritz.box"}
  ```

into this:

  ```json
  {"levelName":"info","level":30,"time":1531171074631,"msg":"hello world","pid":657,"hostname":"Davids-MBP-3.fritz.box"}
  ```

```js
import pino from 'pino'

const logger = pino({
  transport: {
    pipeline: [{
      target: 'pino-template',
      options: {
        // Provide the Eta template here as the "template" property value. The `"it.data"`
        //  object contains the log data (i.e. level, time, msg, hostname etc); while 
        //  the `"it.context"` object contains whatever you provide as the 
        //  `"templateContext"` property below
        template: `<%
        const {context, data} = it; 
      %><%= 
        JSON.stringify({...data, "levelName":context?.levelMapping?.[data.level] ?? data.level}) 
      %>`,
        templateContext: { levelMapping: pino.levels.labels },
      },
    }, {
      // Use target: 'pino/file' with STDOUT descriptor 1 to write
      // logs without any change.
      target: 'pino/file',
      options: { destination: 1 }
    }]
  }
})

logger.info('hello world')
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- PROJECT LINK -->
## Project Link

[https://github.com/cunneen/pino-template](https://github.com/cunneen/pino-template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[eta-url]: https://eta.js.org/
[eta-constructor]: https://eta.js.org/docs/4.x.x/api/overview#setting-up-eta
[issues-shield]: https://img.shields.io/github/issues/cunneen/pino-template.svg?style=for-the-badge
[issues-url]: https://github.com/cunneen/pino-template/issues
[license-shield]: https://img.shields.io/github/license/cunneen/pino-template.svg?style=for-the-badge
[license-url]: https://github.com/cunneen/pino-template/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
[Typescript-url]: https://www.typescriptlang.org/
[Nodejs-url]: https://nodejs.org/
[pino.js]: https://getpino.io
[EJS-url]: https://ejs.co/
[dynamic-import]: https://nodejs.org/api/esm.html#import-expressions
[pino-transport-pipeline]: https://getpino.io/#/docs/transports?id=creating-a-transport-pipeline

<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->
[Eta]: https://img.shields.io/badge/%CE%B7-Eta-a8b1ff "Eta"
[EJS]: https://img.shields.io/badge/ejs-#B4CA65?logo=ejs&logoColor=fff "EJS"
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff "TypeScript"
[Node.js]: https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white "Node.js"
