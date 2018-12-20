const windowWidth = wx.getSystemInfoSync().windowWidth;
const WRITE_IMG = 'scope.writePhotosAlbum';
const imgCache = {};

class CanvasPainter {
    constructor({canvasId, context, config, scaleBase = 750} = {}) {
        this.canvasId = canvasId;
        this.ctx = wx.createCanvasContext(canvasId, context);
        this.context = context;
        this.config = config;
        this.picPath = null;

        const scale = windowWidth / scaleBase;
        this.ctx.scale(scale, scale);

        this.downloadTask = [];
    }

    resetConfig(config){
        this.config = config;
        this.loadImg = false;
        this.picPath = null;
    }

    loadImgInAdvance() {
        this.config.forEach((config)=>{
            if (config.type === 'image' && config.url) {
                this.downloadTask.push(CanvasPainter.downloadSingleImage(config));
            }
        });
        this.loadImg = true;
    }

    draw() {
        const ctx = this.ctx;
        if(!this.loadImg) { this.loadImgInAdvance(); }

        return Promise.all(this.downloadTask).then(() => {
            //按照数组顺序，从底层到顶层画图
            this.config.forEach((item)=>{
                switch (item.type) {
                    case 'image':
                        if(item.url) {
                            CanvasPainter.drawImage(ctx, item);
                        }
                        break;
                    case 'text':
                        CanvasPainter.drawSingleText(ctx, item);
                        break;
                    case 'multiline_text':
                        CanvasPainter.drawMultiText(ctx, item);
                        break;
                    case 'rect':
                        CanvasPainter.drawRect(ctx, item);
                        break;
                    default:
                        break;
                }
            });
        }).then(()=>{
            return new Promise((resolve) => {
                ctx.draw(false, resolve);
            });
        })
    }

    toPic(){
        const self = this;
        return this.picPath ? Promise.resolve(this.picPath) :
            new Promise((res, reject)=>{
                wx.canvasToTempFilePath({
                    canvasId: self.canvasId,
                    success({tempFilePath}) {
                        self.picPath = tempFilePath;
                        res(tempFilePath);
                    },
                    fail:reject
                }, self.context);
            });
    }

    preview(){
        const self = this;
        return this.toPic().then(()=>{
            return new Promise((resolve, reject)=>{
                wx.previewImage({
                    current: self.picPath,
                    urls: [self.picPath],
                    success: resolve,
                    fail: reject
                });
            })
        });   
    }

    save(){
        const self = this;
        return this.toPic().then(()=>{
            return new Promise((resolve, reject) => {
                const saveImage = (resolve, reject)=>{
                    wx.saveImageToPhotosAlbum({
                        filePath: self.picPath,
                        fail: reject,
                        success: resolve
                    });
                };
                // 判断是否已授权下载图片到本地
                wx.getSetting({
                    success ({authSetting = {}}={}) {
                        const authorizedSaveImg = authSetting[WRITE_IMG];
                        if(!authorizedSaveImg) {
                            wx.authorize({
                                scope: WRITE_IMG,
                                success() { saveImage(resolve, reject); },
                                fail() { reject({ errMsg: 'saveImageToPhotosAlbum:fail auth deny'}); }
                            });
                        } else { saveImage(resolve, reject); }
                    }
                })
            });
        });
    }

    static downloadSingleImage(config) {
        let url = config.url;

        // 可加入url test
        if(imgCache[url]) {
            config.path = imgCache[url];
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: url,
                    success: (res) => {
                        config.path = res.path;
                        imgCache[url] = res.path;
                        resolve(res);
                    },
                    fail: () => {
                        // 如有需要 可下载暂位图片
                        console.log(`下载图片失败：, ${url}，即将下载占位图片`);
                        // CanvasPainter.downloadSingleImage({ url: '' })
                        // .then((path)=>{
                        //     config.path = path;
                        //     resolve();
                        // }).catch(reject);
                    }
                });
            });
        }
    }

    static drawRect(ctx, config) {
        const setColor = config.stroke ? 'setStrokeStyle' : 'setFillStyle';
        const method = config.stroke ? 'strokeRect' : 'fillRect';
        ctx[setColor](config.color || '#ffffff');

        if(config.round) {
            ctx.arc(config.x + config.width / 2, config.y + config.height / 2, config.width / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx[method](config.x, config.y, config.width, config.height);
        }
    }
    
    static drawSingleText(ctx, config) {
        ctx.setFontSize(config.size || 20);
        ctx.setTextAlign(config.align || 'left');
        ctx.setFillStyle(config.color || '#000000');
        ctx.fillText(config.text, config.x, config.y);
        //从中间画一条线
        if(config.decoration === 'line-through'){
            let {width} = ctx.measureText(config.text);
            let y = config.y - config.size/2 + 2;
            ctx.beginPath();
            ctx.setLineWidth(1);
            ctx.setStrokeStyle(config.color);
            ctx.moveTo(config.x, y);
            ctx.lineTo(config.x + width+2, y);
            ctx.closePath();
            ctx.stroke();
        }
        if(config.font) { ctx.font = config.font; }
    }

    static drawMultiText(ctx, config) {
        //根据lineLimit拆成多个singleText，顺序往下排
        if (config.text.length <= config.line_limit) {
            this.drawSingleText(ctx, config);
        } else {
            let parts = parseInt(config.text.length / config.line_limit) + 1;
            for (let idx = 0; idx < parts; idx++) {
                //拼出n个single text
                let subConfig = {};
                Object.assign(subConfig, config);
                subConfig.text = subConfig.text.substr(idx * config.line_limit, config.line_limit);
                subConfig.y = config.y + idx * config.line_height;
                this.drawSingleText(ctx, subConfig);
            }
        }
    }

    static drawImage(ctx, config) {
        if (config.round) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(config.x + config.width / 2, config.y + config.height / 2, config.width / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.closePath();
        }
        ctx.drawImage(config.path, config.x, config.y, config.width, config.height);
    }
}

export default CanvasPainter;