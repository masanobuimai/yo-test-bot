import fs from 'fs';
import path from 'path';
import {create} from './bot';

import SimpleRules from '../rules.json';
const simpleRules: { [key: string]: string } = SimpleRules;

import FavoritePhrases from '../favorite-phrases.json';
const favoritePhrase: { [username: string]: string[] } = FavoritePhrases;

import BukiList from '../buki-list.json';
const bukiList:string[] = BukiList;

const randomChoice = (array: string[]) => array[Math.floor(Math.random() * array.length)];
const myPhrase = (name:string) => {
  if (favoritePhrase[name] === undefined) {
    favoritePhrase[name] = [randomChoice(favoritePhrase['_default_'])];
  }
  return randomChoice(favoritePhrase[name]);
}

const token = process.env.BOT_TOKEN;
if (!token) {
  console.log('Environment variable BOT_TOKEN is missing.');
  process.exit(1);
}

const watchDir = path.join(__dirname, '..', 'autoplay');
const voiceDir = path.join(__dirname, '..', 'voices');

const voices = fs.readdirSync(voiceDir).map(f => path.join(voiceDir, f));
const minPitch = 220;
const pitchRange = 60;

const halfAns = new RegExp(/^(?!\/)[\x20-\x7e]*$/);
const kanji = new RegExp(/^[一-龠 ]*$/u);
const trans = new RegExp(/^\/[a-z][a-z]-[a-z][a-z] .*$/);
const transAuto = new RegExp(/^\/-[a-z][a-z] .*$/);
const bot = create(token, voices, minPitch, pitchRange, [
  ({content, author: {username}}) => username === 'まさほふ' && content === '/unk' && '最強のうんこちんちん',
  ({content}) => content === '/buki' && `オレは ${randomChoice(bukiList)}でいく`,
  ({content}) => halfAns.test(content) && `:en${content}`,
  ({content}) => kanji.test(content) && `:zh${content}`,
  ({content}) => trans.test(content) && `;${content.substring(1)}`,
  ({content}) => transAuto.test(content) && `;ja${content.substring(1)}`,
  ({content, author: {username}}) => [simpleRules[content] || content, myPhrase(username)].join('')
]);

fs.watch(watchDir, { persistent: true }, (event, filename) => {
  if (event !== "rename") {
    const sound = path.join(watchDir, filename);
    if (path.extname(filename) == ".mp3") {
      console.log('play (volume 0.4):' + sound);
      bot.play(sound, 0.4);
    } if (path.extname(filename) == ".wav") {
      console.log('play:' + sound);
      bot.play(sound);
    }
  }
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    bot.exit();
    process.exit(0);
  });
});

(async () => {
  try {
    await bot.run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
