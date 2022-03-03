import Akinator, { AkiniatorGet, Jawab } from '../lib/';
import Bluebird= require('bluebird')
import inquirer from "inquirer";


(async () => {
	const Game = {
		id: "1",
		region: "id"
	}
	const client = new Akinator(Game.region as AkiniatorGet.SupportLanguage, false);
	await client.StartGame(Game.id, async (question, progress) => {
		if (progress > 90) {
			let result = await client.FinishGame(Game.id);
			console.log(result)
		}
		require("inquirer").prompt([
			{
				type: "list",
				name: "answer",
				message: question,
				choices: [...client.infoGameID(Game.id)?.game?.answer, "Undo"]
			}
		]).then(async (answer: { answer: string }) => {
			if (answer.answer === "Undo") return console.log(await client.undoAnswer(Game.id));
			await client.send(Game.id, answer.answer as Jawab)
		})
	})
})()