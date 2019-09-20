export class Global {

    static readonly Instance: Global = new Global()

    _token: string = null

    get token() {
        cc.log("token got:" + this._token);
        return this._token;
    }
    
    set token(value) {
        this._token = value
        if (value == null || value == "null") {
            // debugger;
        }
    }

    get enemy() {
        if(!G.roomData)
            return null
    }

    /**
     * 数据来源接口
     */
    getData(){
        //临时
        let data = {
            me:{
                gamedata:{
                    isenemy:false,
                    maxhp:19500,
                    power:{},
                    cardid:1,
                },
                ft:{
                    IOST:24000,
                    NEO:20,
                    ETH:1,
                    COCOS:0,
                    BNB:0,
                    BTC:0,
                },
            },
            enemy:{
                gamedata:{
                    isenemy:true,
                    maxhp:25500,
                    power:{},
                    cardid:2,
                },
                ft:{
                    IOST:0,
                    NEO:250,
                    ETH:1,
                    COCOS:0,
                    BNB:20,
                    BTC:0,
                },
            },
        }
        return data
    }

    /**
     * 通证价格
     */
    COIN ={
        STAND:{
            PRICE:10000,//标准
            COLOR:"#d9b800",
        },
        BTC:{
            PRICE:71826,
            COLOR:"#ffffff",
        },
        ETH:{
            PRICE:1300,
            COLOR:"#5f52bb",
        },
        NEO:{
            PRICE:65,
            COLOR:"#5ca27a",
        },
        IOST:{
            PRICE:0.05,
            COLOR:"#e8e3e9",
        },
        COCOS:{
            PRICE:0.009,
            COLOR:"#50bfed",
        },
        BNB:{
            PRICE:141,
            COLOR:"#dcce00",
        },
    }

    /**
     * html全局变量
     */
    HTMLVal:any = {};
    
    player: any = {}
    
    eventBus = new cc.EventTarget()

    GAME_SCENE = "game";

    /**
     * 房间数据
     */
    roomData: any = null

    /**
     * 分数难度梯度
     */
    SCORE_RANK = [
        {RANK:1,SCORE:5000,MAX_NUM_GEN:5},
        {RANK:2,SCORE:50000,MAX_NUM_GEN:6},
        {RANK:3,SCORE:200000,MAX_NUM_GEN:7},
        {RANK:4,SCORE:500000,MAX_NUM_GEN:8},
        {RANK:5,SCORE:0,MAX_NUM_GEN:8},
    ]

    RANK = [
        { SCORE: 0, NAME: "小小玩家", URL: "texture/ranksign0" },
    ]

    TIME = {
		RATE: 1000,//用于换算其他毫秒的
		SECOND_SMALL_SMALL_SMALL_2: 0.002,
		SECOND_SMALL_SMALL_SMALL_5: 0.005,
		SECOND_SMALL_SMALL: 0.01,
		SECOND_SMALL_SMALL_2: 0.02,
		SECOND_SMALL_SMALL_3: 0.03,
		SECOND_SMALL_SMALL_4: 0.04,
		SECOND_SMALL_SMALL_5: 0.05,
		SECOND_SMALL_SMALL_6: 0.06,
		SECOND_SMALL: 0.1,
		SECOND_SMALL_2: 0.2,
		SECOND_SMALL_3: 0.3,
		SECOND_SMALL_4: 0.4,
		SECOND_SMALL_5: 0.5,
		SECOND_SMALL_6: 0.6,
		SECOND_SMALL_7: 0.7,
		SECOND: 1,
		SECOND_2: 2,
		SECOND_3: 3,
		SECOND_4: 4,
		SECOND_5: 5,
		SECOND_10: 10,
		SECOND_15: 15,
		SECOND_20: 20,
		MINUTE: 60,
		NET_INTERVAL: 5
    }

    COLORS = {
        HIGHLIGHT:cc.color(255,255,255,255),
        LOWLIGHT:cc.color(150,150,150,255),
        BLOCKBOARD: cc.color(0, 0, 0, 130),// "#333333",
        BTN_MATCH_ON: cc.color(70, 187, 192),//匹配按钮
        BTN_MATCH_OFF: cc.color(250, 200, 110),//取消按钮
        RANK_1:cc.color(240, 95, 70),
        RANK_2:cc.color(110, 180, 80),
        RANK_3:cc.color(70, 187, 192),
        RANK_N:cc.color(125, 115, 180),

        BG: [
            "#C0C3CC",
            "#A5A7AD",
            "#e6efc0",
            "#BECCF1",
            "#FFF58F",
            "#FFCD83",
            "#D7F1F4",
            "#AEB7EC",
        ]
    }

    /**
     * 分享时显示的标题随机数组
     */
    ShareTitleArr:string[] = [
        "看看你这次能连多少分",
    ]

    /**
     * 分享时显示的图片资源路径随机数组
     */
    ShareImgArr:string[] = [
        "http://s.t1t1t.cn/shareimg0.png",
        "http://s.t1t1t.cn/shareimg1.png",
    ]

    /**
     * 其他游戏appid
     */
    OtherGame:any[] = [
        //魔法消除
        {SIGN:"xdwjy", APPID:"wx8adc91a1197a66f7", QR:"http://www.t1t1t.cn/wxgame/dwjy/qr.jpg",SELF:true},
    ]

    wxgame:any = {
        infobutton:null,//权限信息按钮
        bannerad:null,//底部广告
        videoad:null,//激励广告视频
    }
}

export const G = Global.Instance;
