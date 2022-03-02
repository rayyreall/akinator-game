import Akinator, { AkiniatorGet, Jawab } from '../lib/';
import inquirer from "inquirer";


(async () => {
	const Game = {
		id: "1",
		region: "id"
	}
	const client = new Akinator(Game.region as AkiniatorGet.SupportLanguage, false);
	let status = 0;
	await client.StartGame(Game.id, async (question, progress) => {
		if (progress > 90) {
			let result = await client.FinishGame(Game.id);
			console.log(result)
		}
		status++
		require("inquirer").prompt([
			{
				type: "list",
				name: "answer",
				message: question,
				choices: client.infoGameID(Game.id)?.game?.answer
			}
		]).then(async (answer: { answer: string }) => {
			await client.send(Game.id, answer.answer as Jawab)
		})
	})
})()