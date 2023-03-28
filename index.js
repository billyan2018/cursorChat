const DATA_PREFIX = 'data: ';
const API_ROOT = 'https://aicursor.com';
const decoder = new TextDecoder('utf-8');

function readStream(reader, handler) {
  reader.read().then(({ done, value }) => {
    if (done) {
      return;
    }
    const rawValue = decoder.decode(value);
    const lines = rawValue.split('\n');
    let stopped = false;
    for (let line of lines) {

      if (line.startsWith(DATA_PREFIX)) {
        const jsonString = line.slice(DATA_PREFIX.length)
        if (jsonString === '[DONE]') {
          stopped = true;
          break;
        }
        const content = JSON.parse(jsonString);
        handler(content);
      }
    }
    if (!stopped) {
      readStream(reader, handler);
    }
  });

}

function buildReqData(message) {
  return {
    botMessages: [],
    contextType: 'copilot',
    rootPath: '/Desktop/temp',
    userMessages: [],
    userRequest: {
      precedingCode: [''],
      suffixCode: [''],
      copilotCodeBlocks: [],
      customCodeBlocks: [],
      codeBlockIdentifiers: [],
      message: message,
      msgType: 'freeform',
      currentRootPath: '/temp'
    }
  };
}

function buildFetchOption(message) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*',
      authority: 'aicursor.com',
      referer: 'http://localhost:3000/',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/0.1.7 Chrome/108.0.5359.62 Electron/22.0.0 Safari/537.36',
    },
    'content-type': "application/json",
    body: JSON.stringify(buildReqData(message)),
  };
}

function chat(message, callback) {

  fetch(`${API_ROOT}/conversation`, buildFetchOption(message)).then(res => {
    const reader = res.body.getReader();
    readStream(reader, callback);

  });
}

// node entry point
const args = process.argv.slice(2);
console.log(args);
chat(args.join(' '), (line) => {
  process.stdout.write(line);
});
