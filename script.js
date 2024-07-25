findFiles();

function findFiles() {
	fetch('fileNames.json').then((response) => response.text()).then((json) => {
		processFiles(JSON.parse(json));
	});
}

function processFiles(json) {
	doc = document.getElementById("quiz");
	json.years.forEach((year) => {
		let button = document.createElement("button");
		let text = document.createTextNode(year.year);
		button.setAttribute("class", "unit");
		button.appendChild(text);
		button.onclick = function() {
			doc.innerHTML = "";
			mainMenu(year);
		};
		doc.appendChild(button);
	});
}

function process(year, unit) {
	fetch('JSON/' + year + '/' + unit + '.json').then((response) => response.text()).then((json) => {
		quiz(JSON.parse(json));
	});
}

function mainMenu(json) {
	let doc = document.getElementById('quiz');
	let subtitleText = document.createTextNode("Select a quiz");
	let subtitle = document.createElement("p");
	subtitle.append(subtitleText);
	doc.append(subtitle);
	units = json.units;
	units.forEach((unit) => {
		let button = document.createElement("button");
		let text = document.createTextNode(unit);
		button.setAttribute("class", "unit");
		button.appendChild(text);
		button.onclick = function() {
			doc.innerHTML = "";
			process(json.year, unit);
		};
		doc.appendChild(button);
	})
}

function quiz(quiz) {
	let dom = document.getElementById("quiz");
	dom.innerHTML = "";
	let div = document.createElement("div");
	div.setAttribute("id", "questions");
	let questions = shuffle(quiz.vocab);
	let stats = {
		"index": questions.length - 1,
		"correct": 0
	}
	let title = document.createElement("p");
	title.setAttribute("class", "unit");
	let titleText = document.createTextNode(quiz.unit);
	title.append(titleText);
	dom.append(title);
	dom.append(div);
	generateQuestion(questions, stats);
}

function generateQuestion(quiz, stats) {
	if (stats.index == -1) endQuiz(quiz.length, stats);

	let wrong = shuffle([...quiz]);
	let options = [wrong[0], wrong[1], wrong[2], wrong[3]];
	let answer = quiz[stats.index];
	if (options.indexOf(answer) == -1) {
		let rand = Math.trunc(Math.random() * 4);
		options[rand] = answer;
	}

	let rand = Math.random() >= 0.5;
	let japanese = answer.kana;
	if (answer.kanji != "") japanese = answer.kanji;
	let question = "#" + (quiz.length - stats.index) + " Translate: " + (rand ? japanese : answer.english);

	let div = document.getElementById("questions");
	div.innerHTML = question + "<br>";
	options.forEach((option) => {
		let button = document.createElement("button");
		button.setAttribute("class", "option");
		japanese = option.kana;
		if (option.kanji != "") japanese = option.kanji;
		let opTxt = rand ? option.english : japanese;
		let text = document.createTextNode(opTxt);
		button.appendChild(text);
		button.onclick = function() { checkAnswer(option == answer, quiz, stats) };
		div.appendChild(button);
	})

	let button = document.createElement("button");
	let buttonText = document.createTextNode("End early");
	button.append(buttonText);
	button.onclick = function() {
		div.innerHTML = "";
		endQuiz(quiz.length - stats.index - 1, stats);
	}
	div.append(button);
}

function endQuiz(total, stats) {
	let quiz = document.getElementById("quiz");
	quiz.innerHTML = "";
	let end = document.createElement("p");
	end.setAttribute("class", "unit");
	let endText = document.createTextNode("Congratulations!");
	end.append(endText);
	let endStats = document.createTextNode("Your score is: " + stats.correct + "/" + total + " (" + (total != 0 ? stats.correct / total * 100 : 0) + "%)");
	quiz.append(end);
	quiz.append(endStats);
	let mainMenu = document.createElement("button");
	let menuTxt = document.createTextNode("Main menu");
	mainMenu.onclick = function() {
		quiz.innerHTML = "";
		findFiles();
	}
	mainMenu.append(menuTxt);
	quiz.innerHTML += "<br>";
	quiz.append(mainMenu);
}

function checkAnswer(isCorrect, quiz, stats) {
	let div = document.getElementById("questions");
	let title = document.createElement("p");
	title.setAttribute("class", "sub");
	let answer = quiz[stats.index];
	stats.index--;
	if (isCorrect) {
		let titleTxt = document.createTextNode("Correct");
		title.append(titleTxt);
		stats.correct++;
	}
	else {
		let titleTxt = document.createTextNode("Wrong");
		title.append(titleTxt);
	}
	div.innerHTML += "<br>";
	let answerTxt = document.createTextNode((answer.kanji != "" ? answer.kanji + "(" + answer.kana + ")" : answer.kana) + " - " + answer.english);
	let answerObj = document.createElement("p");
	answerObj.append(answerTxt);
	div.append(title);
	div.append(answerObj);
	let cont = document.createElement("button");
	let text = document.createTextNode("Continue");
	cont.onclick = function() {
		div.innerHTML = "";
		generateQuestion(quiz, stats);
	}
	cont.append(text);
	div.append(cont);
}

function shuffle(array) {
	let curIndex = array.length;
	let arr = [...array];

	while (curIndex != 0) {
		let randIndex = Math.floor(Math.random() * curIndex);
		curIndex--;
		[arr[curIndex], arr[randIndex]] = [
			arr[randIndex], arr[curIndex]];
	}
	return arr;
}