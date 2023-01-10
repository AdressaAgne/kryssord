import fs from 'fs';

export class Kryssord {
	board = [];
	used = [];
	wordlist = [];
	startWords = [];
	failedList = [];
	preset = () => {};
	failes = 0;

	constructor(list, options) {
		// Set default options
		this.options = Object.assign({ size: 5 }, options);
		this.board = new Array(this.options.size * this.options.size);

		this.preset = () => {
			this.addToBoard('telle', 0, 0, true);
			this.addToBoard('tiårs', 0, 0, false);
			this.addToBoard('ideal', 0, 1, true);
		};

		this.wordlist = list.filter((word) => word.length == options.size);

		this.failedListFilename = `./data/failed_${this.options.size}.txt`;
		this.succesListFilename = `./data/success_${this.options.size}.txt`;

		if (fs.existsSync(this.failedListFilename)) {
			this.failedList = []; //fs.readFileSync(this.failedListFilename).toString().split('\n');
		}

		this.startWords = this.wordlist.filter((word) => {
			for (let i = 0; i < this.failedList.length; i++) {
				const failedStartWord = this.failedList[i][0];
				if (word == failedStartWord) return false;
			}
			return true;
		});

		this.preset();
		this.printBoard();
		this.generateBoard();
	}

	getWordFromBoard(x, y, horizontal) {
		let out = '';
		if (horizontal) {
			for (let i = 0; i < this.options.size; i++) {
				out += this.board[y * this.options.size + i] || '?';
			}
			return out;
		}
		for (let i = 0; i < this.options.size; i++) {
			out += this.board[x + i * this.options.size] || '?';
		}
		return out;
	}

	generateBoard() {
		this.used = [];
		this.board = [];
		this.preset();

		for (let i = 0; i < this.options.size * 2; i++) {
			const x = Math.floor(i / 2);
			const y = Math.ceil(i / 2);
			const odd = i % 2 == 1;

			if (this.used.indexOf(this.getWordFromBoard(x, y, !odd)) > -1) {
				continue;
			}

			const word = this.getWord(x, y, !odd);

			if (!word) {
				process.stdout.write(`failes: ${++this.failes}\r`);
				//this.startWords = this.startWords.filter((word) => word !== this.used[0]);
				//fs.appendFileSync(this.failedListFilename, this.used + '\n', 'utf-8');
				return process.nextTick(this.generateBoard.bind(this));
			}

			this.addToBoard(word, x, y, !odd);
			//this.printBoard();
		}

		if (this.used.length == this.options.size * 2) {
			console.log('\nSuccess');
			this.printBoard();
			fs.appendFileSync(this.succesListFilename, this.used + '\n', 'utf-8');
		}
	}

	addToBoard(word, x = 0, y = 0, horizontal = true) {
		if (!word) return;

		for (let i = 0; i < word.length; i++) {
			const letter = word.charAt(i);

			if (horizontal) {
				this.board[y * this.options.size + i] = letter;
				continue;
			}
			// vertical
			this.board[x + i * this.options.size] = letter;
		}

		this.used.push(word);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	getWord(x = 0, y = 0, horizontal) {
		const list = this.wordlist.filter((word) => {
			if (this.used.indexOf(word) > -1) return false;

			for (let i = 0; i < word.length; i++) {
				if (horizontal) {
					const letterX = this.board[y * this.options.size + i];
					if (letterX && word.charAt(i) != letterX) {
						return false;
					}
					continue;
				}
				const letterY = this.board[x + i * this.options.size];
				if (letterY && word.charAt(i) != letterY) {
					return false;
				}
			}
			return true;
		});

		if (list.length == 0) {
			return false;
		}

		return this.getRandomWordFromList(list);
	}

	getRandomNumber(min, max) {
		return Math.floor(Math.min(Math.random() * (max + 1 - min)) + min);
	}

	getRandomWordFromList(list = this.wordlist) {
		return list[this.getRandomNumber(0, list.length)];
	}

	printBoard() {
		for (let i = 0; i < this.board.length; i++) {
			const letter = this.board[i];
			const x = i % this.options.size;
			const y = Math.floor(i / this.options.size);
			if (x == 0 && y !== 0) process.stdout.write(`\n`);
			process.stdout.write(`|${letter || ' '}`);
			if (x == this.options.size - 1) process.stdout.write(`|`);
		}
		process.stdout.write(`\n`);

		if (this.used.length > 2) {
			console.log(this.used.slice(0, -1).join(', ') + ' og ' + this.used.slice(-1));
		}
	}
}
