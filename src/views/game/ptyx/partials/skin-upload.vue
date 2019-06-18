<template>
  <div :class="'ptyx-skin__' + levelOne + '--' + levelTwo" :key="levelTwo" v-loading="loading" @mouseenter="optShow = true" @mouseleave="optShow = false">
    <img :src="obj.imgUrl" />
    <div class="ptyx-skin__btn" v-show="optShow">
      <label class="ptyx-skin__btn--upload">
        <input type="file" style="display:none;" accept="image/gif, image/jpeg,image/png" ref="uploader" v-skinUpload="this" />
        <i class="iconfont icon-yd-icon-upload2"></i>
      </label>
      <div class="ptyx-skin__btn--reset"><i class="iconfont icon-zhongzhi" @click="skinReset"></i></div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import config from '@/config';
const maxSize = 2 * 1024 * 1024; //5M
axios.defaults.withCredentials = true;
const reqUrl = '/api-plug/upload-img';
export default {
  props: {
    levelOne: {
      type: String,
      default: ''
    },
    levelTwo: {
      type: String,
      default: ''
    },
    obj: {
      type: Object,
      default() {
        return {
          code: '',
          imgUrl: ''
        };
      }
    }
  },
  data() {
    return {
      loading: false,
      optShow: false
    };
  },
  methods: {
    skinReset() {
      this.$emit('skinReset', { levelOne: this.levelOne, levelTwo: this.levelTwo });
    }
  },
  directives: {
    skinUpload: {
      inserted(el, binding) {
        const _vm = binding.value;
        el.addEventListener('change', function() {
          _vm.loading = true;
          if (el.files[0].size > maxSize) {
            _vm.$tips({ type: 'warning', message: '上传图片不能大于2M' });
            return;
          }
          let formData = new FormData();
          formData.append('file', el.files[0]);
          formData.append('requestProject', 'gic-web');
          axios
            .post(config.api + reqUrl, formData)
            .then(res => {
              _vm.loading = false;
              el.value = '';
              if (res.data.errorCode === 0) {
                const code = res.data.result[0].imageFiledCode;
                const imgUrl = res.data.result[0].qcloudImageUrl;
                _vm.$emit('skinUpload', { levelOne: _vm.levelOne, levelTwo: _vm.levelTwo, code, imgUrl });
                _vm.$tips({ type: 'success', message: '上传成功' });
              } else {
                _vm.$tips({ type: 'error', message: res.data.message || '上传失败' });
              }
            })
            .catch(error => {
              _vm.loading = false;
              _vm.$tips({ type: 'error', message: error.msg || '上传失败' });
            });
        });
      }
    }
  }
};
</script>
