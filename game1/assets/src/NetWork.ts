import WebSocketClient from "./WebSocketClient";
import Game from "./Game";
import { G } from "./G";

/**
 * @author SeASon`
 * 网络通信层
 */
export namespace NetWork {
	let socket: WebSocketClient;


	interface NetRequest {
		promise: PromiseLike<ServerMessage>,
		resolve: (message: ServerMessage) => any,
		time: number,
		timeout: number
	}

	export enum StatusCode {
		SUCC = 0,

		EXPIRE = 401,
		INTERNAL_SERVER_ERROR = 500,
		TIMEOUT = 504,
		UNKNOWN_ERROR = 599,
	}

	/**
	 * 从服务端传来的消息
	 */
	interface ServerMessage {

		/**
		 * 服务端本条消息对应响应的请求
		 */
		requestID?: number;

		/**
		 * 数据。通常在非错误情况下才存在
		 */
		data?: object|any;

		/**
		 * 状态码
		 */
		code: StatusCode;

		/**
		 * 消息。通常为错误消息
		 */
		msg?: string;
	}

	let online: boolean = false;

	/**
	 * 当前是否为在线。
	 */
	export function isOnline(): boolean {
		return online;
	}

	const _requests: { [key: number]: NetRequest } = {};
	let _requestID = 1;

	export let reconnecting: boolean = false;

	let _init = false;

	/**
	 * 初始化网络接口
	 */
	export function init() {

		if (_init) return;
		_init = true;

		socket = new WebSocketClient();
		partCommon();
		setInterval(() => {
			const now = Date.now();

			for (let reqID in _requests) {
				const req = _requests[reqID];
				if (req.timeout > 0 && (now - req.time > req.timeout)) {
					const result: ServerMessage = {
						msg: "网络超时",
						code: StatusCode.TIMEOUT,
						requestID: reqID as any,
					};
					_requests[reqID].resolve.call(_requests[reqID].promise, result);
					delete _requests[reqID];
				}
			}

			return false;
		}, 150);

		socket.on("S_response", (resp: ServerMessage) => {
			// dtap.verbose(`response got`);

			resp.code = StatusCode.SUCC;

			if (resp.requestID) {
				// dtap.verbose(`response got for ${resp.requestID}`);
				const reqID = resp.requestID;
				_requests[reqID].resolve.call(_requests[reqID].promise, resp);
				delete _requests[reqID];
			}
		});

		socket.on("S_error", (resp: any) => {
			// dtap.verbose(`err got`);
			if (resp.requestID) {
				// dtap.verbose(`err got for ${resp.requestID}`);
				const reqID = resp.requestID;
				const result: ServerMessage = {
					msg: resp.msg,
					code: resp.code || StatusCode.UNKNOWN_ERROR,
					requestID: reqID,
				};
				_requests[reqID].resolve.call(_requests[reqID].promise, result);
				delete _requests[reqID];
			}
		});


	}

	/**
	 * 向服务端发送数据（不请求回应）
	 */
	export function emit(name, data: any = {}) {
		// if (Player.me) {
		// 	data.loginToken = Player.token;
		// 	data.playerId = Player.me.id;
		// }
		socket.emit("C_data", {
			name,
			msg: data
		});
	}

	/**
	 * 向服务端请求数据。
	 */
	export function request(name: string, data: any = {}, timeout = 8000): Promise<ServerMessage> {

		if(G.token) data.token = G.token;
		const id = _requestID++;
		// dtap.verbose(`requesting ${id} for ${name}`);
		const promise = new Promise<ServerMessage>((resolve, reject) => {

			_requests[id] = {
				promise,
				resolve,
				timeout,
				time: Date.now()
			};

			const msg = data;
			data.requestID = id;

			socket.emit("C_data", {
				name,
				msg
			});
		});

		_requests[id].promise = promise;
		return promise;
	}

	/**
	 * 向服务端请求数据，带有token参数。
	 */
	export function requestWithToken(name, data: any = {}, timeout = 8000): Promise<ServerMessage> {
		data.token = G.token;
		// data.playerId = Player.me.id;

		return request(name, data, timeout);
	}

	function dropSelf(): void {

	}

	// class Api<TParam, TResp> {
	// 	reqPath: string;
	// 	constructor(reqPath: string, reqOverride?: Function) {
	// 		this.reqPath = reqPath;
	// 	}
	//
	// 	request(param: TParam): Promise<TResp> {
	// 		return NetWork.request(this.reqPath, param);
	// 	}
	//
	// }


	/**
	 * 通用部分
	 */
	function partCommon(): void {

		socket.on("connect", function (data) {
			console.log("connect " + data);
			online = true;
		});

		//断开连接
		socket.on("disconnect", function (data) {
			console.log("disconnect " + data);
			online = false;
			// self.dropSelf();
		});

		//连接失败
		socket.on("connect_failed", function (data) {
			online = false;
			console.log("connect_failed " + data);
		});

		//重连
		socket.on("reconnect", function (data) {
			online = true;
		});

		//正在重连
		socket.on("reconnecting", function (data) {
		});

		//重连失败
		socket.on("reconnect_failed", function (data) {
			console.log("reconnect_failed " + data)
		});

		//过期，来自服务端的踢下线
		socket.on("S_expire", function (data) {
		});


		socket.on("S_loadOver", function(data) {
			console.log("S_loadOver")
			G.eventBus.emit("S_loadOver", data);
		})
		socket.on("S_startGame", function(data) {
			console.log("S_startGame")
			G.eventBus.emit("S_startGame", data);
		})
		socket.on("S_updateGameData", function(data) {
			console.log("S_updateGameData")
			G.eventBus.emit("S_updateGameData", data);
		})
		socket.on("S_restarting", function(data) {
			console.log("S_restarting")
			G.eventBus.emit("S_restarting", data);
		})
		socket.on("S_restart", function(data) {
			console.log("S_restart")
			G.eventBus.emit("S_restart", data);
		})
		socket.on("S_ensureMatch", function (data) {
			console.log("S_ensureMatch")
			G.eventBus.emit("S_ensureMatch", data);
		});
		socket.on("S_matchFail", function (data) {
			console.log("S_matchFail")
			G.eventBus.emit("S_matchFail", data);
		});
	}
}

// NetWork.init();
