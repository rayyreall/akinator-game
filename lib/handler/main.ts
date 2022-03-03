import { request, DEFAULT_HEADERS, SupportedLanguages } from "../utils/utils";
import Errors from "../errors/error";
import Events from "././events";
import Bluebird = require("bluebird");
import httpsAgent = require("https-proxy-agent");
import type { ConfigAkinator, AkiniatorGet, Jawab } from "../typings";
import type { AxiosResponse, AxiosRequestHeaders, AxiosRequestConfig } from "axios";

export default class Akinator extends Events {
	public DEFAULT_URL: string;
	public static  DEFAULT_SET_URL (region?: string): string {
		return `https://${region}.akinator.com`;
	}
	private Game: Map<string, any> = new Map();
	constructor(private region?: AkiniatorGet.SupportLanguage, private modeChild?: boolean, private costumRequest?: AxiosRequestConfig, private config: ConfigAkinator = {}) {
		super()
		this.region = region || "id";
		if (this.modeChild == undefined || this.modeChild == null) this.modeChild = false;
		this.config.player = this.config.player || "website-desktop";
		this.config.partner = this.config.partner || 1;
		this.config.jqueryCode = this.config.jqueryCode || "jQuery341024240301569257983_";
		this.config.constraint = this.config.constraint || "ETAT<>'AV'";
		this.config.soft_constraint = this.modeChild ? "ETAT%3D%27EN%27" : "";
		this.config.question_filter = this.modeChild ? "cat%3D1" : "";
		this.config.modeChild = this.modeChild
		if (SupportedLanguages.find((value) => this.region === value) == undefined) throw new Errors("Language not supported");
		this.DEFAULT_URL = Akinator.DEFAULT_SET_URL(this.region);
	}
	private async getToken() {
		return new Bluebird<AkiniatorGet.TokenReturn  | null>(async (resolve, reject) => {
			let options: Object = Object.create(null);
			let req: ReturnType<typeof request> = request({ headers: DEFAULT_HEADERS as unknown as AxiosRequestHeaders, baseURL: this.DEFAULT_URL, ...this.costumRequest  });
			let response: AxiosResponse = await req("/game", "GET")
			await req("/", "GET").then(async res => {
				const regex: RegExp = /\[{"translated_theme_name":"(.*?)","urlWs":"(.*?)","subject_id":"(.*?)"}]/g;
				Object.assign(options, JSON.parse(regex.exec(res.data)?.[0] || "{}")[0], { uid_ext_session: /uid_ext_session = (.*?);/i.exec(response.data)?.[1].replace(/\'/g, ""), frontaddr: /frontaddr = '(.*?)'/g.exec(response.data)?.[1] });
				Object.freeze(options);
				resolve(options as AkiniatorGet.TokenReturn);
			}).catch(err => {
				console.log(err);
				resolve(null);
			})
		})
	}
	private async createURLStart (): Promise<{ url: string, [key: string]: string}> {
		let token: AkiniatorGet.TokenReturn | null = await this.getToken();
		let JQuerry: string = `${this.config.jqueryCode}${Date.now()}`;
		if (!token) throw new Errors("Token not found");
		return {
			url: `/new_session?callback=${JQuerry}&urlApiWs=${token.urlWs}&partner=${this.config.partner}&childMod=${this.config.modeChild}&player=${this.config.player}&uid_ext_session=${token.uid_ext_session}&frontaddr=${token.frontaddr}&constraint=${this.config.constraint}&soft_constraint=${this.config.soft_constraint}&question_filter=${this.config.question_filter}`,
			uid_ext_session: token.uid_ext_session,
			frontaddr: token.frontaddr,
			urlApiWs: token.urlWs,
			JQuerry,
			...this.config as any
		}
	}
	private createURLQuestioner (id: string, answer: Jawab): string {
		let getInfo: AkiniatorGet.GetInfo = this.Game.get(id);
		let JQuerry: string = `${this.config.jqueryCode}${Date.now()}`;
		if (!getInfo) throw new Errors("Game not started");
		return `/answer_api?callback=${JQuerry}&urlApiWs=${getInfo.sessions.urlApiWs}&session=${getInfo.sessions.session}&signature=${getInfo.sessions.signature}&step=${getInfo.game.step}&frontaddr=${getInfo.sessions.frontaddr}&answer=${ (getInfo.game.answer.findIndex((x: string) => x === answer))}&question_filter=${getInfo.sessions.question_filter}`
	}
	private createURLFinish (id: string): string {
		let getInfo: AkiniatorGet.GetInfo = this.Game.get(id);
		let JQuerry: string = `${this.config.jqueryCode}${Date.now()}`;
		if (!getInfo) throw new Errors("Game not started");
		return `${getInfo.sessions.urlApiWs}/list?callback=${JQuerry}&signature=${getInfo.sessions.signature}${this.config.modeChild ? `&childMod=${this.config.modeChild}` : ""}&step=${getInfo.game.step}&session=${getInfo.sessions.session}`
	}
	private createURLAnswerCancel (id: string): string {
		let getInfo: AkiniatorGet.GetInfo = this.Game.get(id);
		let JQuerry: string = `${this.config.jqueryCode}${Date.now()}`;
		if (!getInfo) throw new Errors("Game not started");
		return `${getInfo.sessions.urlApiWs}/cancel_answer?callback=${JQuerry}&session=${getInfo.sessions.session}${this.config.modeChild ? `&childMod=${this.config.modeChild}` : ""}&signature=${getInfo.sessions.signature}&step=${getInfo.game.step}&answer=-1&question_filter=${getInfo.sessions.question_filter}`
	}
	public async undoAnswer(id: string) {
		if (!this.Game.has(id)) throw new Error("Game not started");
		let req: ReturnType<typeof request> = request({ headers: DEFAULT_HEADERS as unknown as AxiosRequestHeaders, ...this.costumRequest });
		let result: any = (await req(this.createURLAnswerCancel(id), "GET")).data;
		result = JSON.parse(result.substring(result.indexOf("(") + 1, result.indexOf(")"))).parameters;
		let getInfo: AkiniatorGet.GetInfo = this.Game.get(id);
		getInfo.game.questions = result.question;
		getInfo.game.answer = result.answers.map((a: { answer: string }) => a.answer);
		getInfo.game.step = result.step;
		getInfo.game.progression = result.progression;
		getInfo.game.questionid = result.questionid;
		getInfo.game.infogain = result.infogain;
		getInfo.game.status_minibase = result.status_minibase;
		getInfo.game.options = result.options;
		this.Game.set(id, getInfo);
		this.emit(id, getInfo.game.questions, parseInt(getInfo.game.progression));
		return this.Game.get(id) as AkiniatorGet.GetInfo
	}
	public async StartGame (id: string, callback?: (questions: string, progress: number) => void ): Promise<void> {
		if (this.Game.has(id)) throw new Error("Game already started");
		let url: { url: string, [key: string]: string} | null = await this.createURLStart();
		let req: ReturnType<typeof request> = request({ headers: DEFAULT_HEADERS  as unknown as AxiosRequestHeaders, baseURL: this.DEFAULT_URL, ...this.costumRequest  });
		let result: any = (await req(url.url, "GET")).data;
		result = JSON.parse(result.substring(result.indexOf("(") + 1, result.indexOf(")"))).parameters
		let newConfig: any = { sessions: {}, game: {}};
		for (const key in result.identification) {
			newConfig.sessions[key] = result.identification[key];
		}
		newConfig.sessions = { ...newConfig.sessions, ...url };
		newConfig.game.questions = result.step_information.question;
		newConfig.game.answer = result.step_information.answers.map((a: { answer: string }) => a.answer);
		newConfig.game.step = result.step_information.step
		newConfig.game.progression = result.step_information.progression
		newConfig.game.questionid = result.step_information.questionid
		newConfig.game.infogain = result.step_information.infogain
		delete newConfig.sessions.url;
		this.Game.set(id, newConfig);
		this.on(id, (question: string) => {
			if (callback) return void callback(question, parseInt(newConfig.game.progression));
		})
		if (newConfig.game.questions) this.emit(id, newConfig.game.questions, parseInt(newConfig.game.progression));
		return void 0;
	};
	public async send (id: string, answer: Jawab): Promise<AkiniatorGet.GetInfo> {
		if (!this.Game.has(id)) throw new Error("Game not started");
		let req: ReturnType<typeof request> = request({ headers: DEFAULT_HEADERS  as unknown as AxiosRequestHeaders, baseURL: this.DEFAULT_URL, ...this.costumRequest  });
		let result: any = (await req(this.createURLQuestioner(id, answer), "GET")).data;
		result = JSON.parse(result.substring(result.indexOf("(") + 1, result.indexOf(")"))).parameters
		let getInfo: AkiniatorGet.GetInfo = this.Game.get(id);
		getInfo.game.questions = result.question;
		getInfo.game.answer = result.answers.map((a: { answer: string }) => a.answer);
		getInfo.game.step = result.step;
		getInfo.game.progression = result.progression;
		getInfo.game.questionid = result.questionid;
		getInfo.game.infogain = result.infogain;
		getInfo.game.status_minibase = result.status_minibase;
		getInfo.game.options = result.options;
		this.Game.set(id, getInfo);
		this.emit(id, getInfo.game.questions, parseInt(getInfo.game.progression));
		return this.Game.get(id) as AkiniatorGet.GetInfo
	}
	public async FinishGame(id: string): Promise<Array<AkiniatorGet.Response>> {
		if (!this.Game.has(id)) throw new Error("Game not started");
		let req: ReturnType<typeof request> = request({ headers: DEFAULT_HEADERS  as unknown as AxiosRequestHeaders, ...this.costumRequest  });
		let result: any = (await req(this.createURLFinish(id), "GET")).data;
		result = JSON.parse(result.substring(result.indexOf("(") + 1, result.indexOf(")"))).parameters.elements;
		this.removeAllListeners(id)
		this.Game.delete(id);
		return result.map((a: { element: AkiniatorGet.Response}) => a.element);
	};
	public removeGameID(key: string): boolean {
		return this.Game.delete(key);
	}
	public infoGameID(key: string): AkiniatorGet.GetInfo | undefined {
		return this.Game.get(key);
	}
}