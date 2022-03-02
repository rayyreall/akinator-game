export namespace AkiniatorGet {
	export interface TokenReturn {
		translated_theme_name: string;
		urlWs: string;
		subject_id: string;
		uid_ext_session: string;
		frontaddr: string;
	}
	export interface GetInfo {
		sessions: SessionsInfo;
		game: GameInfo;
	}
	export interface GameInfo {
		questions: string;
		answer: Array<string>;
		step: string;
		progression: string;
		questionid: string;
		infogain: string;
		status_minibase: string;
		options: Array<unknown>;
	}
	interface SessionsInfo {
		channel: number;
		session: string;
		signature: string;
		challenge_auth: string;
		uid_ext_session: string;
		frontaddr: string;
		urlApiWs: string;
		JQuerry: string;
		player: string;
		partner: number;
		jqueryCode: string;
		constraint: string;
		soft_constraint: string;
		question_filter: string;
		modeChild: string;
	}
	export interface Response {
		id: string;
		name: string;
		id_base: string;
		proba: string;
		description: string;
		valide_contrainte: string;
		ranking: string;
		pseudo: string;
		picture_path: string;
		corrupt: string;
		relative: string;
		award_id: string;
		flag_photo: number;
		absolute_picture_path: string;
	}
	export type SupportLanguage = "id" | "jp" | "de" | "pt" | "ar" | "fr" | "en" | "es" | "ru" | "il" | "cn" | "it" | "kr" | "tr" | "nl" | "pl";
};

export enum Jawab {
	iya = 'Iya',
	tidak = "Tidak",
	tidak_tahu = "Tidak tahu",
	mungkin = "Mungkin",
	mungkin_tidak = "Mungkin tidak"
}