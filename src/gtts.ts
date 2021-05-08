const googleTTS = require('google-tts-api');
const https = require('https');
const Stream = require("stream");
const translate = require('@vitalets/google-translate-api');


export const getVoice = (lang: string, text: string, s?:any) => {
  const stream = s === undefined ? new Stream.PassThrough() : s;
  googleTTS
    .getAudioBase64(text, {lang: lang, slow: false})
    .then((base64: string) => {
      const buf = Buffer.from(base64, 'base64')
      stream._read = () => {};
      stream.push(buf);
      stream.push(null);
    }).catch((err: Error) => {
    console.error(err);
  });
  return stream;
}

export const getTransVoice = (from: string, to: string, text: string) => {
  const stream = new Stream.PassThrough();
  let transText:string;
  translate(text, {from: from, to: to})
    .then((res: any) => {
      console.log(res.text);
      transText = res.text;
      console.log(`(${from})"${text} -> (${to})"${transText}`)
      getVoice(to, transText, stream);
   }).catch((err: Error) => {
    console.error(err);
  });
  return stream;
}

