import { config1, config2 } from './canvasData';

Page({
  example1Instance:null,
  data:{
    example1: {
      data: config1,
      show: false
    },
    openType: null
  },
  setCanvasInstance(e){
    const instance = e.detail;
    this.example1Instance = instance;
  },

  openCanvas1(){
    this.setData({
      'example1.show': true
    })
    this.example1Instance.draw()
    .then(()=>{
      console.log('画图成功');
    })
    .catch((e)=>{
      console.log('画图失败', e);
    });
  },
  closeCanvas1(){
    this.setData({ 'example1.show': false });
  },
  previewCanvas1(){
    this.example1Instance.previewPic();
  },
  editCanvas1(){
    this.setData({
      'example1.data': config2
    }, () => {
      this.example1Instance.draw();
    });
  },
  saveCanvas1(){
    this.setData({ isSaving: true });
    this.example1Instance.savePic()
    .then(()=>{
        wx.showToast({title:'保存成功', icon:'none'});
        this.closeCanvas(id);
    }).catch((e)=>{
        wx.showToast({title:'保存被拒绝了', icon:'none'});
        if(e.errMsg && e.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
            this.setData({openType: 'openSetting'});
        }
    }).then(()=>{
        this.setData({
            isSaving: false
        })
    });
  },
});