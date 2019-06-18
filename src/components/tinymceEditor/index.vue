<!--

安装 tinymce
$ npm install @tinymce/tinymce-vue -S

npm install tinymce -S

安装之后，在 node_modules 中找到 tinymce/skins 目录，然后将 skins 目录拷贝到 static 目录下

文中所有 static 目录相关都这样处理

tinymce 默认是英文界面，所以还需要下载一个中文语言包：
中文：https://tinymce-services.azurewebsites.net/1/i18n/download?langs=zh_CN

然后将这个语言包放到 static 目录下，为了结构清晰，包一层 tinymce 目录

static
|____tinymce
     |___skins
     |___zh_CN.js

<tinymce-edit ref="tinymceWrap" :bodyHtml="ruleForm.gradeDescribe" :projectName="projectName"></tinymce-edit>


import tinymceEdit from 'components/memberShip/tinymce-edit'


公共上传图片请求方法
/*
 * method: 'post'
 *  data: params
 *
 */
export const postForm = (url, params) => {
  params.requestProject = "gic-clique";
  return Vue.axios({
    method: 'post',
    url: `${local}${url}`,
    data: params,

    headers: {}
  });
}

引入路径修改成自己的路径

 -->
<template>
  <div class="tinymce-contain">
    <editor id="tinymce" v-model="tinymceHtml" :init="init"></editor>
  </div>
</template>
<script>
// import { getRequest,postForm } from '../../api/api';

import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/modern/theme';
import Editor from '@tinymce/tinymce-vue';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
export default {
  name: 'tinymce-edit',
  props: ['bodyHtml', 'projectName'],
  data() {
    return {
      // tinymce
      tinymceHtml: '请输入内容',
      init: {
        language_url: 'static/tinymce/zh_CN.js',
        language: 'zh_CN',
        skin_url: 'static/tinymce/skins/lightgray',
        height: 300,
        // 图片上传
        // without images_upload_url set, Upload tab won't show up
        // images_upload_url: '',
        // images_upload_base_path: '/some/basepath',
        images_upload_credentials: true, //是否应传递cookie等跨域的凭据
        // images_upload_handler提供三个参数：blobInfo, success, failure
        images_upload_handler: (blobInfo, success, failure) => {
          console.log(blobInfo);
          // this.handleImgUpload(blobInfo, success, failure)
        },
        // 添加插件
        plugins: 'link lists image code table colorpicker textcolor wordcount contextmenu',
        toolbar: 'bold italic underline strikethrough | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent blockquote | undo redo | link unlink image code | removeformat',
        branding: false,
        setup: function(editor) {
          // 点击编辑框回调
          editor.on('click', function(e) {
            console.log('Editor was clicked');
          });
        }
      }
    };
  },

  methods: {
    // 上传图片
    // handleImgUpload (blobInfo, success, failure) {
    //   var that = this
    //   let formdata = new FormData()
    //   formdata.set('upload_file', blobInfo.blob())
    //   formdata.set("requestProject",that.repProjectName);
    //   console.log(formdata)
    //   postForm('/api-plug/upload-img', formdata).then(res => {
    //     success(res.data.result[0].qcloudImageUrl)
    //   }).catch(res => {
    //     console.log(res)
    //     failure('error')
    //   })
    // },
  },
  watch: {
    projectName: function(newData, oldData) {
      var that = this;
      // console.log("新数据:",newData,oldData)
      that.repProjectName = newData || 'gic-web';
    },
    bodyHtml: function(newData, oldData) {
      var that = this;
      // console.log("新数据:",newData,oldData)
      that.tinymceHtml = newData;
    }
  },
  components: {
    Editor
  },
  mounted() {
    var that = this;
    tinymce.init({});
    that.tinymceHtml = that.bodyHtml;
  }
};
</script>
<style lang="scss" scoped>
.tinymce-contain {
  width: 890px;

  /deep/ .mce-tinymce {
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    border: 1px solid #dcdfe6;
  }

  /deep/ .mce-panel {
    border: 0px solid #dcdfe6;
  }
}
</style>
