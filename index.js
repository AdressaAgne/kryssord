import fs from 'fs';
import { Kryssord } from './app.js';

fs.promises.readFile('./data/words.txt').then((buffer) => {
	const string = buffer.toString();
	const list = string.split('\n');

	const kryssord = new Kryssord(list, {
		size: 5,
	});
});
