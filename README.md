## 小工具CanvasPainter.js

### 囊括在小程序内canvas画图基本需求：

- 用配置形式画图(暂支持单行及多行文本，矩形，圆形，图片及圆形图片类型)，预览及保存成图片，且皆为Promise格式。
- canvas尺寸以一般设计稿的750px为准(可配)，在不同屏幕机型下等比缩放。
- 生成图片时，支持图片预下载，及在一个小程序周期内缓存图片下载的tmp路径。

js库路径: [地址](https://github.com/DearVikki/wxa-canvas2pic/blob/master/pages/component/canvas-pic/CanvasPainter.js)

使用也很简单：

```
import CanvasPainter from './CanvasPainter';

const config = [
{type:'rect, width: 640, height: 560, x: 0, y: 0, color: '#fff'},
{type: 'text', text: '测试文本', color: '#1499f8',size: 50, x: 30,y: 100}
]

// 初始化
const painter = new CanvasPainter({
    canvasId: `canvasId`,
    context: this, // 组件内使用需传this
    config //画图路径
});
painter.loadImgInAdvance(); //预下载图片到本地；如不主动调用，则draw的时候会再下载。

// 更新画图路径
painter.resetConfig(newConfig);

// 画图
painter.draw().then(() => {
		console.log('画图完成');   
}).catch(e => {
    console.log('生成图片失败', e);
});

// 预览
painter.preview();

// 保存
painter.save().then(() => {
		console.log('保存图片完成');   
}).catch(e => {
    console.log('保存图片失败', e);
});
```

### 完整API
##### 初始化

`new CanvasPainter(options)`

`options`

- `canvsId`: canvas-id。

- `context`: canvas使用时上下文，在组件内使用时传入this即可。

- `config`: Array[]。绘图路径。支持类型如下：

  - rect 矩形

    ```
    完整配置：{
    	type: 'rect',
    	width: 640,
    	height: 560,
    	x:0,
    	y:0,
    	color: '#fff', // fill下为填充颜色，storke下为笔迹颜色
    	stroke(可选): true, // 代表模式为fill还是stroke。默认false，即fill状态。
    	round(可选): true, // 代表是否为圆形。默认false。
    }
    ```

  - text 文本

    ```
    完整配置：{
    	type: 'text',
    	x:0,
    	y:30,
    	color: '#fff', // 字色
    	font: 'xx', // 字体
    	size: 20, //字号
    	align: 'center', //对齐。默认left。
    	decoration(可选): 'line-through', // 暂时只有中划线模式哈哈哈
    }
    ```
  - multiline_text 多行文本

    ```
    完整配置：{
    	type: 'multiline_text',
    	line_limit: 30, //每行字数
    	line_height: 20, //行高
    	... //其余都与text一致
    }
    ```
  - image 图片

    ```
    完整配置：{
    	type: 'image',
    	url: '', //图片路径
    	x: '', y: '', width: '', height:'',
    	round(可选): true, // 圆形。默认false。
    }
    ```

- `saleBase(可选)`: 按设计稿尺寸来，默认750。

##### 预下载图片：

`canvasPainter.loadImgInAdvance()`。可在实例化CanvasPainter后立即调用。

##### 绘图: 

`canvasPainter.draw()`

##### 预览大图: 

`canvasPainter.preview()`

##### 保存成图片: 

`canvasPainter.save()`

##### 更改config：

`canvasPainter.resetConfig(newConfig)`