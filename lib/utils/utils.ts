import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import type { RequestOptions, IHeaders  } from "../typings"
import Errors from "../errors/error";
import Bluebird = require("bluebird");

export function request (config: AxiosRequestConfig): RequestOptions {
	return async (url: string, method: "GET" | "POST" | "PUT" = "GET", data: any = {}): Promise<AxiosResponse> => {
		return new Bluebird<AxiosResponse>((resolve, reject) => {
			let req: AxiosInstance = axios.create({
				...config as AxiosRequestConfig
			});
			req({ url, method, data }).then(res => {
				resolve(res);
			}).catch(err => {
				reject(new Errors(err.message));
			})
		})
	}
}

// extends const type
export const DEFAULT_HEADERS: IHeaders  = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.3",
	"x-requested-with": "XMLHttpRequest"
}

export const SupportedLanguages: string[] = [
	"id",
	"jp",
	"de",
	"pt",
	"ar",
	"fr",
	"en",
	"es",
	"ru",
	"il",
	"cn",
	"it",
	"kr",
	"tr",
	"nl",
	"pl"
];