import { G } from "./G";
import { SERVER_ADDR_WS } from "./config";

/**
 * 模拟Socketio机制的事件接收器
 */
class eventReceiver extends cc.Component {
    private eventHandlers : Function[] = [];

    trigger(event: string, data: any) {
        if(this.eventHandlers[event]) {
            this.eventHandlers[event](data);
        }
    }

    on(event: string, handler: Function) {
        this.eventHandlers[event] = handler;
    }
}

/**
 * 封装了WebSocket客户端，使其达到类似SocketIO客户端的用法。
 */
export default class WebSocketClient extends eventReceiver {
    ws: WebSocket;

    delayedData = {};

    reconnecting : boolean = false;
    connecting : boolean = false;

    private connect() {
        // this.ws.connect("avalonserver.imwork.net", 80);
        if(this.ws) {
            try {
                this.ws.close();
            } catch(e) {
                cc.log(e);
            }
        }
        const wsAddr = SERVER_ADDR_WS;

        this.ws = new WebSocket(wsAddr);
        // egret.warn("connecting WebSocket : " + wsAddr);

        this.ws.onopen = () => this.onSocketOpen();
        this.ws.onclose = () => this.onSocketClose();
        this.ws.onmessage = (ev) => this.onReceiveMessage(ev);
        this.ws.onerror = (e) => this.onSocketError(e);

        // this.ws.connectByUrl(wsAddr);

        this.connecting = true;
    }

    constructor() {
        super();
        this.connect();

        cc.director.getScheduler().schedule(this.timerFunc, this, 100, false);

        // this.schedule(this.timerFunc, 0, cc.macro.REPEAT_FOREVER);
    }

    timerFunc() {
        if(this.connecting) {
            // 超时未连上，重新再连
            this.connect();
        }
    }

    private onSocketOpen() {
        this.trigger("connect", null);
        this.connecting = false;

        for(let i in this.delayedData) {
            try {
                this.emit(i, this.delayedData[i]);
                delete this.delayedData[i];
            }catch(e) {
                //ignore
            }
        }

        if(this.reconnecting) {
            this.reconnecting = false;
            this.trigger("reconnect", true);
        }
    }

    private onSocketClose() {
        // console.log("onSocketClose!");
        this.trigger("disconnect", null);
        //reconnect
        this.connect();
        this.reconnecting = true;
    }

    private onReceiveMessage(e: MessageEvent) {
        const msg = e.data;
        let event = null;
        try {
            event = JSON.parse(msg);
        } catch(e) {
            console.log("收到不符合JSON格式的信息！" + msg);
            console.log(e);
            return;
        }
        if(event.name) {
        //    console.log("recv: " + event.name);
            this.trigger(event.name, event.data);
        } else {
            console.log("收到缺少数据的信息！" + msg);
        }
    }

    private onSocketError(err) {
        console.log("onSocketError!");
        cc.log(err);
    }

    /**
     * 发送信息
     */
    emit(name: string, data: any = {}) {
        if(this.ws.readyState == WebSocket.OPEN) {
        //    console.log("send: " + name);
            this.ws.send(JSON.stringify({name, data}));
        } else {
            this.delayedData[name] = data;
        }
    }
    
}
