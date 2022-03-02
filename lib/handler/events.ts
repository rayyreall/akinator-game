export default class Events {
	private all: { [key: string]: any };
	constructor() {
		this.all = {};
	}
	public addListener (event: string, fn: any) {
		this.all[event] = this.all[event] || [];
		this.all[event].push(fn);
		return this;
	}
	public on (event: string, fn: any) {
		return this.addListener(event, fn);
	}
	public emit(event: string, ...args: any[]) {
		if (this.all[event]) {
			this.all[event].forEach((fn: any) => {
				fn.apply(this, args);
			});
		}
		return this;
	}
	public removeListener(event: string, fn: any) {
		if (this.all[event]) {
			this.all[event] = this.all[event].filter((f: any) => f !== fn);
		}
		return this;
	}
	public removeAllListeners(event: string) {
		if (this.all[event]) {
			delete this.all[event];
		}
		return this;
	}
}