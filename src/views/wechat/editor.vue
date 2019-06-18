<template>
  <section class="dm-wrap" v-loading="loading">
    <el-form class="editor-wrap block-center clearfix">
      <div class="editor-list fl border1">
        <h4 class="editor-list_title">图文列表</h4>
        <div class="editor-list-box">
          <div class="editor-list-first" @click="choice(firstImgText, 'first')" :class="{ active: activeClass === 'first' }">
            <div class="editor-list-first_inner" :style="'background-image: url(' + firstImgText.qcloudImageUrl + ')'">
              <i class="el-icon-picture editor-list-first_default" v-show="!firstImgText.qcloudImageUrl"></i>
              <p class="ellipsis-100">
                <span>{{ firstImgText.titleName || '标题' }}</span>
              </p>
            </div>
          </div>
          <div @mouseenter="v.toolbar = true" @mouseleave="v.toolbar = false" v-for="(v, i) in imgTextList" :key="i" class="editor-list-item" @click="choice(v, i)" :class="{ active: activeClass === i }">
            <div class="clearfix editor-list-item_inner">
              <span class="fl ellipsis-50">{{ v.titleName || '图文' + (i + 2) }}</span>
              <div class="fr" :style="'background-image: url(' + v.qcloudImageUrl + ')'">
                <i class="el-icon-picture editor-list-item_default" v-show="!v.qcloudImageUrl"></i>
              </div>
              <p class="editor-list-item_move clearfix" v-show="v.toolbar">
                <i class="el-icon-upload2 fl fz16 pr10" @click.stop="moveTop(v, i)" v-show="i !== 0"></i>
                <i class="el-icon-download fl fz16" @click.stop="moveBottom(v, i)" v-show="i !== imgTextList.length - 1"></i>
                <i class="el-icon-delete fr fz16" @click.stop="deleteItem(v, i)"></i>
              </p>
            </div>
          </div>
          <div class="editor-list-add" v-if="imgTextList.length < 7 && $route.meta.type === 'add'">
            <i class="el-icon-plus" @click="addTextToList"></i>
          </div>
        </div>
      </div>
      <div class="editor-content fr border1">
        <div class="editor_triangle"></div>
        <div class="editor-inner">
          <p class="line-height2"><span class="danger-color">*</span> 标题</p>
          <dm-input size="medium" v-model="activeImgText.titleName" :maxlength="64"></dm-input>
          <p class="line-height2 pt10">作者</p>
          <dm-input size="medium" v-model="activeImgText.authorName" :byteType="1" :maxlength="8"></dm-input>
          <p class="line-height2 pt10">封面 <span class="gray fz12">(大图片建议尺寸：900像素 * 500像素)</span></p>
          <upload-img url="/api-marketing/marketing-wechat-image-save" class="inline-block" :model.sync="postImg" :showImg="false" width="auto" label="本地上传" tips="" :labelStyle="{ padding: '8px 15px', fontSize: '14px', borderRadius: '4px' }"></upload-img>
          <el-button
            class="ml5"
            @click="
              postFlag = true;
              imgShow = true;
            "
            >从素材中选择</el-button
          >
          <div class="cover_preview" v-show="activeImgText.qcloudImageUrl" :style="'background-image: url(' + activeImgText.qcloudImageUrl + ')'"></div>
          <el-checkbox class="pt10" v-show="activeImgText.qcloudImageUrl" v-model="activeImgText.imageType" :true-label="1" :false-label="0">封面图片显示在正文中</el-checkbox>

          <p class="line-height2 pt10">摘要 <span class="gray fz12">(选填，如果不填写会默认抓取正文前54个字)</span></p>
          <dm-input size="medium" v-model="activeImgText.remark" type="textarea" :rows="4" :maxlength="120"></dm-input>
          <p class="line-height2 mt10"><span class="danger-color">*</span> 正文</p>
          <div class="toolbar">
            <span
              @click="
                postFlag = false;
                imgShow = true;
              "
              ><i class="el-icon-picture"></i><span> 图片</span></span
            >
            <span @click="preVideo"><i class="iconfont icon-shipin"></i><span> 视频</span></span>
            <span @click="cardShow = true"><i class="iconfont icon-qiaquan"></i><span> 卡券</span></span>
          </div>
          <vue-ueditor-wrap ref="ueditor" v-model="activeImgText.content" :destroy="false" :config="config" @ready="ready" :myInit="myInit"></vue-ueditor-wrap>
          <el-checkbox class="pt10" v-model="activeImgText.originalStatus" :true-label="1" :false-label="0">原文链接</el-checkbox>
          <el-input size="medium" v-if="activeImgText.originalStatus" v-model="activeImgText.originalUrl"></el-input>
        </div>
      </div>
    </el-form>
    <!-- 图片弹窗 -->
    <el-dialog title="提示" :visible.sync="imgShow" width="60%" :before-close="close">
      <dm-img-box :activeId.sync="mediaId" :scrollStyle="{ maxHeight: '500px', overflowY: 'auto', overflowX: 'hidden' }"></dm-img-box>
      <span slot="footer" class="dialog-footer"><el-button @click="close">关 闭</el-button></span>
    </el-dialog>
    <!-- 视频 -->
    <el-dialog title="提示" :visible.sync="videoShow" width="60%" :before-close="close">
      <el-tabs v-model="videoActiveName">
        <el-tab-pane label="视频素材" name="first">
          <video-temp :chooseFlag="true" :activeId.sync="mediaId" :scrollStyle="{ maxHeight: '300px', overflowY: 'auto' }"></video-temp>
        </el-tab-pane>
        <el-tab-pane label="腾讯视频" name="second">
          <div>
            <span class="fz13">网址：</span>
            <el-input v-model="videoUrl" size="medium" class="w300" placeholder="请输入腾讯视频网址"></el-input>
            <el-button size="medium" type="primary" @click="submitVideoUrl">确定</el-button>
            <a class="pl20" target="_blank" href="https://v.qq.com">前往腾讯视频</a>
          </div>
          <div class="pt20">
            <span class="fz13">预览：</span>
            <div size="medium" class="preview-video gray-bg" ref="videoiframe"></div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer"><el-button @click="close">取 消</el-button><el-button type="primary" @click="videoSubmit">确 定</el-button></span>
    </el-dialog>
    <!-- 卡券弹窗 -->
    <el-dialog title="选择卡券" :visible.sync="cardShow" width="800px" :before-close="close">
      <cardTemp :activeId.sync="mediaId" :pageSize="5"></cardTemp>
      <span slot="footer" class="dialog-footer"><el-button @click="close">取 消</el-button></span>
    </el-dialog>
    <preview :show.sync="previewShow" :imgTextList="imgTextList" :firstImgText="firstImgText"></preview>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="submit" :loading="subLoading">保 存</el-button>
      <el-button @click="previewShow = true">预 览</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </section>
</template>

<script>
import VueUeditorWrap from '@/components/ueditorWrap';
import dmImgBox from '@/components/libs/imgTemp/index-box.vue';
import cardTemp from '@/components/libs/cardTemp';
import videoTemp from './video';
import { wechatImageTextEdit, saveUpdateWechatImageText, getMarketingUserInfo } from '@/service/api/wechatApi.js';
import preview from './preview';
import uploadImg from '@/components/upload/img';
import config from '@/config';
import { upRecord, downRecord, voidStr } from '@/utils/index.js';

export default {
  data() {
    return {
      loading: false,
      subLoading: false,
      activeClass: 'first',
      checked: false,
      msg: '',
      config: {
        // 如果需要上传功能,找后端小伙伴要服务器接口地址
        serverUrl: config.api + '/api-plug/upload-img',
        // 你的UEditor资源存放的路径,相对于打包后的index.html
        UEDITOR_HOME_URL: './static/UEditor/',
        // 编辑器不自动被内容撑高
        autoHeightEnabled: false,
        // 初始容器高度
        initialFrameHeight: 500,
        // 初始容器宽度
        initialFrameWidth: '100%',
        // 关闭自动保存
        enableAutoSave: false,
        elementPathEnabled: false,
        wordCount: false,
        zIndex: 2,
        toolbars: [['fullscreen', 'source', 'fontfamily', 'fontsize', 'bold', 'italic', 'underline', 'forecolor', 'backcolor', 'indent', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', 'imagenone', 'imageleft', 'imageright', 'imagecenter', 'lineheight', 'horizontal', 'formatmatch', 'removeformat', 'link', 'unlink', 'undo', 'redo']],
        initialStyle: `
          html.view { height: 100%; }
          img { max-width: 100%; height: auto !important; }
          iframe.video { display: inline-block; width: calc(100vw - 180px); height: calc(56.451612903225815vw - 101.61290322580646px); }
          iframe.cardticket { width:100%; height: 185px; }
          iframe.audio, iframe.qqmusic { width: 100%; height: 64px; }
          .ueditor-img{width: 80%;}
          `
      },
      imgShow: false,
      videoShow: false,
      cardShow: false,
      mediaId: '',
      editorInstance: null,
      imgTextList: [],
      firstImgText: { titleName: '', authorName: '', remark: '', qcloudImageUrl: '', imageFieldCode: '', imageMediaId: '', imageUrl: '' },
      activeImgText: { titleName: '', authorName: '', remark: '', qcloudImageUrl: '', imageFieldCode: '', imageMediaId: '', imageUrl: '' },
      previewShow: false,
      videoActiveName: 'first',
      videoUrl: '',
      postImg: {
        code: '',
        imgUrl: '',
        mediaId: '',
        wxImg: ''
      },
      postFlag: false,
      imageTextId: this.$route.params.id || '',
      imageTextWechatId: '',

      imgReduce: false
    };
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  watch: {
    videoShow(val) {
      if (!val && this.$refs.videoiframe) {
        this.$nextTick(_ => {
          this.$refs.videoiframe.innerHTML = '';
        });
      }
    },
    postImg: {
      handler(val) {
        console.log(val);
        this.activeImgText.qcloudImageUrl = val.imgUrl;
        this.activeImgText.imageFieldCode = val.code;
        this.activeImgText.imageMediaId = val.mediaId;
        this.activeImgText.imageUrl = val.wxImg;
      },
      deep: true
    }
  },
  components: {
    VueUeditorWrap,
    dmImgBox,
    cardTemp,
    videoTemp,
    preview,
    uploadImg
  },
  created() {
    this.getMarketingUserInfo();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理' }, { name: '微信营销', path: '' }, { name: '素材库', path: '/wechat/temp' }, { name: '图文编辑', path: '' }]);
    //监听获取图片   封面图或者正文图片
    // eslint-disable-next-line
    $bus.$on('img-temp-choose', val => {
      if (this.imgReduce) return;
      this.imgReduce = true;
      setTimeout(_ => {
        this.imgReduce = false;
      }, 300);
      // debugger
      if (this.postFlag) {
        this.activeImgText.qcloudImageUrl = val.qcloudImageUrl;
        this.activeImgText.imageUrl = val.imageUrl;
        this.activeImgText.imageFieldCode = val.imageFieldCode;
        this.activeImgText.imageMediaId = val.imageMediaId;
        this.imgShow = false;
      } else {
        this.imgSubmit(val.qcloudImageUrl);
      }
    });
    //监听视频
    // eslint-disable-next-line
    $bus.$on('video-temp-choose', val => {
      if (this.imgReduce) return;
      this.imgReduce = true;
      setTimeout(_ => {
        this.imgReduce = false;
      }, 300);
      this.videoSubmit(val);
    });
    //监听卡券
    // eslint-disable-next-line
    $bus.$on('card-temp-choose', val => {
      if (this.imgReduce) return;
      this.imgReduce = true;
      setTimeout(_ => {
        this.imgReduce = false;
      }, 300);
      this.cardSubmit(val);
    });
  },
  methods: {
    //editorInstance实例
    ready(editorInstance) {
      this.editorInstance = editorInstance;
      if (this.$route.meta.type === 'edit') {
        this.wechatImageTextEdit();
      } else {
        this.activeImgText = this.firstImgText;
      }
    },

    //结合init方法,自定义按钮
    myInit() {
      //
    },
    //卡券视频图片弹窗关闭
    close() {
      this.imgShow = this.videoShow = this.cardShow = false;
    },
    //获取appid
    async getMarketingUserInfo() {
      let res = await getMarketingUserInfo();
      if (res.errorCode === 0) {
        sessionStorage.setItem('enterprise', JSON.stringify(res.result.enterprise));
        sessionStorage.setItem('componentAppid', res.result.component_appid || '');
        sessionStorage.setItem('fwhHost', res.result.fwh_host || '');
      }
      console.log(res);
    },
    //提交图片到富文本框
    imgSubmit(val) {
      this.imgShow = false;
      console.log(val);
      this.editorInstance.execCommand('inserthtml', `<img class="ueditor-img" src="${val}"/>`);
    },
    //提交视频到富文本框
    videoSubmit(val) {
      this.videoShow = false;
      console.log(val);
      this.editorInstance.execCommand('insertmpvideo', val.videoMediaId);
    },
    //提交卡券到富文本框
    cardSubmit(val) {
      this.cardShow = false;
      this.editorInstance.execCommand('insertcardticket', val);
    },

    //初始化数据 请求数据
    async wechatImageTextEdit() {
      this.loading = true;
      try {
        let res = await wechatImageTextEdit({ imageTextId: this.$route.params.id });
        this.$nextTick(_ => {
          console.log(this.editorInstance);
          this.imgTextList = res.result.imageText.itemList;
          this.imageTextId = res.result.imageText.imageTextId;
          this.imageTextWechatId = res.result.imageText.imageTextWechatId;
          this.firstImgText = this.imgTextList.shift();
          this.activeImgText = this.firstImgText;
        });
      } catch (err) {
        console.log(err);
      }
      this.loading = false;
    },
    submit() {
      if (this.subLoading) {
        return;
      }
      if (voidStr(this.firstImgText.titleName, '首篇文章标题不能为空')) return;
      if (voidStr(this.firstImgText.qcloudImageUrl, '首篇文章封面不能为空')) return;
      if (voidStr(this.firstImgText.content, '首篇文章正文不能为空')) return;
      if (this.firstImgText.originalStatus) {
        if (voidStr(this.firstImgText.originalUrl, '首篇文章原文链接不能为空')) return;
      }
      let flag = false;
      this.imgTextList.forEach((v, i) => {
        flag = voidStr(v.titleName, '第' + (i + 2) + '篇文章标题不能为空');
        flag = voidStr(v.qcloudImageUrl, '第' + (i + 2) + '篇文章封面不能为空');
        flag = voidStr(v.content, '第' + (i + 2) + '篇文章正文不能为空');
        if (v.originalStatus) {
          flag = voidStr(v.originalUrl, '第' + (i + 2) + '篇文章原文链接不能为空');
        }
      });
      if (flag) return;
      this.saveUpdateWechatImageText();
    },

    async saveUpdateWechatImageText() {
      let params = {};
      let list = [];
      if (this.$route.meta.type === 'edit') {
        params.imageTextId = this.imageTextId;
        params.imageTextWechatId = this.imageTextWechatId;
      }
      const type = this.$route.meta.type === 'edit';
      function pushData(item) {
        if (type) {
          list.push({
            imageTextItemId: item.imageTextItemId || '', // 新建不传,修改必传
            authorName: item.authorName || '', // 作者
            titleName: item.titleName || '', // 标题
            originalUrl: item.originalUrl || '', // 原文链接
            originalStatus: item.originalStatus, // 原文链接选中: 1, 没选: 0
            content: item.content, // 正文
            couponType: item.couponType, //优惠券标识（0：否，1：是）
            remark: item.remark, // 摘要
            imageType: item.imageType, // 封面图片显示在正文中  选中: 1 未选0
            // 下面四个参数详情见下
            imageMediaId: item.imageMediaId,
            imageUrl: item.imageUrl,
            imageFieldCode: item.imageFieldCode,
            qcloudImageUrl: item.qcloudImageUrl
          });
        } else {
          list.push({
            authorName: item.authorName || '', // 作者
            titleName: item.titleName || '', // 标题
            originalUrl: item.originalUrl || '', // 原文链接
            originalStatus: item.originalStatus, // 原文链接选中: 1, 没选: 0
            content: item.content, // 正文
            couponType: item.couponType, //优惠券标识（0：否，1：是）
            remark: item.remark, // 摘要
            imageType: item.imageType, // 封面图片显示在正文中  选中: 1 未选0
            // imageTextItemId:item.imageTextItemId, // 新建不传,修改必传
            // 下面四个参数详情见下
            imageMediaId: item.imageMediaId,
            imageUrl: item.imageUrl,
            imageFieldCode: item.imageFieldCode,
            qcloudImageUrl: item.qcloudImageUrl
          });
        }
      }
      pushData(this.firstImgText);
      this.imgTextList.map(v => {
        pushData(v);
      });
      params.itemList = list;

      // console.log(list);
      try {
        this.subLoading = true;
        let res = await saveUpdateWechatImageText({ wechatTeletext: JSON.stringify(params) });
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: type ? '编辑图文成功' : '新建图文成功' });
          this.$router.push('/wechat/temp/imgtext');
        } else {
          this.$tips({ type: 'error', message: res.message || type ? '编辑图文失败' : '新建图文失败' });
        }
      } catch (err) {}
      this.subLoading = false;
    },
    //左侧选择项目
    choice(item, index) {
      this.activeClass = index;
      this.activeImgText = item;
    },
    //增加子项目
    addTextToList() {
      this.imgTextList.push({ authorName: '', titleName: '', originalUrl: '', originalStatus: 0, content: '', couponType: 0, remark: '', imageType: 0, imageTextItemId: '', imageMediaId: '', imageUrl: '', imageFieldCode: '', qcloudImageUrl: '' });
    },
    //删除子项目
    deleteItem(v, i) {
      this.$confirm('确认删除该图文项?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.imgTextList.splice(i, 1);
          this.$tips({ type: 'success', message: '删除成功!' });
        })
        .catch(() => {});
    },
    //上移
    moveTop(v, i) {
      upRecord(this.imgTextList, i);
    },
    //下移
    moveBottom(v, i) {
      downRecord(this.imgTextList, i);
    },

    //提交腾讯视频网址
    submitVideoUrl() {
      if (!/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/.test(this.videoUrl)) {
        this.$tips({ type: 'warning', message: '该网址不是以http://https://开头，或者不是网址！' });
        return;
      }
      this.$refs.videoiframe.innerHTML = `<iframe width="100%" height="100%" src="${this.videoUrl}"></iframe>`;
    },

    preVideo() {
      this.$tips({ type: 'warning', message: '视频暂不可用' });
      return;
      if (this.editorInstance.hasContents()) {
        this.$tips({ type: 'warning', message: '每个图文只能传一个视频，请先清空当前内容' });
        return;
      }
      this.videoShow = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.editor-wrap {
  width: 685px;
  .editor-list {
    width: 248px;
    background-color: #f0f2f5;
    padding-bottom: 40px;
    &_title {
      padding: 20px;
    }
    &-box {
      width: 214px;
      margin: 0px 16px;
    }
    &-first {
      padding: 10px;
      background: #fff;
      &.active {
        border: 2px solid #ff0000;
      }
      cursor: pointer;
      &_inner {
        width: 190px;
        height: 120px;
        background: #ececec;
        position: relative;
        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
        p {
          position: absolute;
          width: 100%;
          height: 24px;
          line-height: 24px;
          left: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          span {
            padding-left: 10px;
          }
        }
      }
      &_default {
        color: #c9c9c9;
        font-size: 40px;
        line-height: 100px;
        text-align: center;
        display: inherit;
      }
    }
    &-item {
      position: relative;
      padding: 10px;
      background: #fff;
      border-bottom: 1px solid #c9c9c9;
      &.active {
        border: 2px solid #ff0000;
      }
      &_inner {
        width: 190px;
        min-height: 50px;
        & > div {
          width: 50px;
          height: 50px;
          background: #ececec;
          position: relative;
          background-position: center center;
          background-size: cover;
          background-repeat: no-repeat;
          text-align: center;
        }
      }
      &_default {
        color: #c9c9c9;
        font-size: 40px;
        line-height: 50px;
        text-align: center;
      }
      &_move {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 24px;
        background: rgba(0, 0, 0, 0.5);
        width: 100%;
        color: #fff;
        .el-icon-upload2 {
          padding-left: 5px;
        }
        .el-icon-delete {
          padding-right: 5px;
          &:hover {
            color: #f56c6c;
          }
        }
        i {
          line-height: 24px;
          // font-size: 20px;
          cursor: pointer;
          &:hover {
            color: #1890ff;
          }
          span {
            font-size: 10px;
            vertical-align: middle;
          }
        }
      }
    }
  }
  .editor-content {
    width: 422px;
    margin-left: 10px;
    background-color: #f0f2f5;
    border-radius: 4px;
    padding-bottom: 40px;
    position: relative;
    .editor_triangle {
      transform: rotate(45deg);
      position: absolute;
      left: -5px;
      top: 30px;
      width: 10px;
      height: 10px;
      background-color: #f0f2f5;
      border: 1px solid #dddddd;
      border-top: none;
      border-right: none;
    }
    .editor-inner {
      padding: 10px;
      .cover_preview {
        position: relative;
        text-align: center;
        color: #fff;
        margin-top: 10px;
        width: 140px;
        height: 140px;
        overflow: hidden;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
      }
    }
  }
}

.preview {
  min-height: 150px;
}
.toolbar {
  display: flex;
  justify-content: space-around;
  font-size: 20px;
  border: 1px solid #d4d4d4;
  height: 50px;
  align-items: center;
  background: #fff;
  width: 100%;
  border-bottom: none;
  span {
    font-size: 16px;
    color: #909399;
    vertical-align: middle;
    cursor: pointer;
    &:hover {
      color: #1890ff;
    }
    i {
      font-size: 24px;
      vertical-align: middle;
    }
    .icon-shipin {
      font-size: 32px;
    }
    .icon-qiaquan {
      font-size: 18px;
    }
    span {
      line-height: 40px;
    }
  }
}
.preview-video {
  display: inline-block;
  width: 500px;
  height: 360px;
  vertical-align: top;
  box-shadow: 4px 4px 10px rgba(147, 165, 184, 0.3);
  border-radius: 10px;
}
.editor-list-add {
  border: 2px dotted #d9dadc;
  height: 60px;
  line-height: 74px;
  text-align: center;
  i {
    font-size: 40px;
    cursor: pointer;
  }
}
</style>
