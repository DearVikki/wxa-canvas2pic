import CanvasPainter from './CanvasPainter';

let id = 0;

export default Component({
  attached(){
    this.triggerEvent('attached', this);
  },
  properties: {
    canvasData: {
      type: Array,
      observer(_, lastVal) {
        if(!lastVal.length) this._init();
        else this._edit();
      }
    },
    width: Number,
    height: Number,
    preloadImg: {
      type: Boolean,
      value: true
    }
  },
  data: { 
    id: 0
  },
  methods: {
    draw() {
      return this.painter.draw();
    },
    previewPic(){
      return this.painter.preview();
    },
    savePic(){
      return this.painter.save();      
    },
    _init(){
      this.setData({
        id: ++id
      }, () => {
        this.painter = new CanvasPainter({
          canvasId: `wxc_canvas_${this.data.id}`,
          context: this,
          scaleBase: 750,
          config: this.data.canvasData
        });
        if(this.data.preloadImg) { this.painter.loadImgInAdvance(); }
      })
    },
    _edit(){
      this.painter.resetConfig(this.data.canvasData);
      if(this.data.preloadImg) { this.painter.loadImgInAdvance(); }
    }
  }
});