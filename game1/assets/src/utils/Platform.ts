export module Platform {

	export enum TYPE {
		WEB = "web",
		ANDROID = "android",
		IOS = "iOS"
	}

	/**
	 * 检查是否为quicksdk加壳版环境
	 */
	export function isQuick() {
		return !!(this.getType() === TYPE.WEB && getHttpArgs()["token"])
	}

	/**
	 * 检查是否为SoEasySDK环境。
	 */
	export function isSoEasy() {
		return self != top && typeof(ZmSdk) !== 'undefined'
	}

	let zmInitPromise: Promise<ZmSdk>;

	/**
	 * 初始化掌盟sdk环境。
	 */
	export function initZm() {
		if (zmInitPromise) {
			return zmInitPromise
		} else {
			zmInitPromise = new Promise(resolve => {
				let interval = setInterval(() => {
					let zmsdk = ZmSdk.getInstance();
					console.log("init zm 1.2")
					if(zmsdk) {
						clearInterval(interval)
						ZmSdk.getInstance().init(() => {
							console.log("init zm 1.5")
							resolve(ZmSdk.getInstance())
						})
					}
				}, 1000)
			})
			return zmInitPromise
		}
	}

	/**
	 * 获取平台类型
	 */
	export function getType(): TYPE {
		if(isIOSClient()) return TYPE.IOS;
		
		if (typeof (AndroidClient) !== "undefined") {
			return TYPE.ANDROID;
		} else {
			return TYPE.WEB
		}
	}

	/**
	 * 判断页面是否运行于ios客户端中。
	 */
	export function isIOSClient() : boolean {
		return typeof(window) !== "undefined"
			&& typeof(window.webkit) !== "undefined"
			&& typeof(window.webkit.messageHandlers) !== "undefined"
			&& typeof(window.webkit.messageHandlers.iosClient) !== "undefined";
	}

	export function putStorage(key: string, value: string): void {
		if (this.getType() === TYPE.WEB) {
			cc.sys.localStorage.setItem(key, value);
		} else if (this.getType() === TYPE.ANDROID) {
			AndroidClient.putStorage(key, value);
		}
	}

	export function getStorage(key: string): string {
		if (this.getType() === TYPE.WEB) {
			return cc.sys.localStorage.getItem(key);
		} else if (this.getType() === TYPE.ANDROID) {
			return AndroidClient.getStorage(key);
		}
	}

	export function isWeixin(): boolean {
		if (isSoEasy()) return false;
		if (getType() !== TYPE.WEB) return false;
		var ua = navigator.userAgent.toLowerCase();
		if ((ua.match(/MicroMessenger/i) as any) == "micromessenger") {
			cc.log("微信")
			return true;
		} else {
			cc.log("非微信")
			return false;
		}
	}

	export const getHttpArgs = function () {
		const args = {};
		let match = null;
		const search = decodeURIComponent(location.search.substring(1));
		const reg = /(?:([^&]+)=([^&]+))/g;
		while ((match = reg.exec(search)) !== null) {
			args[match[1]] = match[2];
		}
		return args;
	};

}
