const googleTTS = require('google-tts-api');
const https = require('https');
const Stream = require("stream");

export const getVoice = (text: string) => {
  const stream = new Stream.PassThrough();
  googleTTS
    .getAudioBase64(text, {lang:'en',slow:false })
    .then((base64: string) => {
      const buf = Buffer.from(base64, 'base64')
      stream._read = () => {};
      stream.push(buf);
      stream.push(null);
    });
  return stream;
}
