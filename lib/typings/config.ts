export type RequestOptions = (url: string, method?: "GET" | "POST" | "PUT", data?: any) => Promise<import("axios").AxiosResponse>;

export interface IHeaders {
	"User-Agent": string;
	"x-requested-with": string;
}

export interface ConfigAkinator {
	player?: string;
	partner?: number;
	constraint?: string;
	jqueryCode?: string;
	soft_constraint?: string;
	question_filter?: string;
	modeChild?: boolean;
}