<template>
  <el-upload class="avatar-uploader" action="123" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
    <div v-if="imgUrl" :src="imgUrl" class="avatar" :style="'background-image:url(' + imgUrl + ')'"></div>
    <p v-else class="avatar-uploader-icon"><i class="el-icon-picture"></i><span>点击添加图片</span></p>
  </el-upload>
</template>
<script>
// *.3gpp  audio/3gpp， video/3gpp  3GPP Audio/Video
// *.ac3   audio/ac3   AC3 Audio
// *.asf   allpication/vnd.ms-asf  Advanced Streaming Format
// *.au    audio/basic AU Audio
// *.css   text/css    Cascading Style Sheets
// *.csv   text/csv    Comma Separated Values
// *.doc   application/msword  MS Word Document
// *.dot   application/msword  MS Word Template
// *.dtd   application/xml-dtd Document Type Definition
// *.dwg   image/vnd.dwg   AutoCAD Drawing Database
// *.dxf   image/vnd.dxf   AutoCAD Drawing Interchange Format
// *.gif   image/gif   Graphic Interchange Format
// *.htm   text/html   HyperText Markup Language
// *.html  text/html   HyperText Markup Language
// *.jp2   image/jp2   JPEG-2000
// *.jpe   image/jpeg  JPEG
// *.jpeg  image/jpeg  JPEG
// *.jpg   image/jpeg  JPEG
// *.js    text/javascript， application/javascript JavaScript
// *.json  application/json    JavaScript Object Notation
// *.mp2   audio/mpeg， video/mpeg  MPEG Audio/Video Stream， Layer II
// *.mp3   audio/mpeg  MPEG Audio Stream， Layer III
// *.mp4   audio/mp4， video/mp4    MPEG-4 Audio/Video
// *.mpeg  video/mpeg  MPEG Video Stream， Layer II
// *.mpg   video/mpeg  MPEG Video Stream， Layer II
// *.mpp   application/vnd.ms-project  MS Project Project
// *.ogg   application/ogg， audio/ogg  Ogg Vorbis
// *.pdf   application/pdf Portable Document Format
// *.png   image/png   Portable Network Graphics
// *.pot   application/vnd.ms-powerpoint   MS PowerPoint Template
// *.pps   application/vnd.ms-powerpoint   MS PowerPoint Slideshow
// *.ppt   application/vnd.ms-powerpoint   MS PowerPoint Presentation
// *.rtf   application/rtf， text/rtf   Rich Text Format
// *.svf   image/vnd.svf   Simple Vector Format
// *.tif   image/tiff  Tagged Image Format File
// *.tiff  image/tiff  Tagged Image Format File
// *.txt   text/plain  Plain Text
// *.wdb   application/vnd.ms-works    MS Works Database
// *.wps   application/vnd.ms-works    Works Text Document
// *.xhtml application/xhtml+xml   Extensible HyperText Markup Language
// *.xlc   application/vnd.ms-excel    MS Excel Chart
// *.xlm   application/vnd.ms-excel    MS Excel Macro
// *.xls   application/vnd.ms-excel    MS Excel Spreadsheet
// *.xlt   application/vnd.ms-excel    MS Excel Template
// *.xlw   application/vnd.ms-excel    MS Excel Workspace
// *.xml   text/xml， application/xml   Extensible Markup Language
// *.zip   aplication/zip  Compressed Archive
export default {
  props: {
    url: {
      type: String,
      default: '/api-plug/upload-img'
    },
    imgUrl: {
      type: String,
      default: ''
    },
    imgCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      code: '',
      disabled: false,
      loading: false
    };
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.warning('只能上传JPG格式文件!');
        return;
      }
      if (!isLt2M) {
        this.$message.warning('上传头像图片大小不能超过 2MB!');
        return;
      }
      let formData = new FormData();
      formData.append('file', file);
      formData.append('requestProject', 'gic-web');
      this.axios
        .post(this.url, formData)
        .then(res => {
          if (res.data.errorCode === 0) {
            this.$emit('update:imgUrl', res.data.result[0].qcloudImageUrl);
            this.$emit('update:imgCode', res.data.result[0].imageFiledCode);
            this.$tips({ type: 'success', message: '上传成功' });
          } else {
            this.$tips({ type: 'error', message: '上传失败' });
          }
          this.disabled = false;
        })
        .catch(error => {
          this.disabled = false;
          this.$tips({ type: 'error', message: error.msg || '上传失败' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.avatar-uploader {
  /deep/ .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    &:hover {
      border-color: #1890ff;
    }
  }
  .avatar-uploader-icon {
    width: 397px;
    height: 222px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    i {
      font-size: 40px;
      color: #c0c4cc;
    }
    span {
      display: block;
      font-size: 16px;
      color: #909399;
    }
  }
  .avatar {
    width: 397px;
    height: 222px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
}
</style>
