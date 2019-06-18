<template>
  <div>
    <label class="el-button el-button--primary" :class="{ 'is-disabled': disabled }">
      {{ disabled ? '上传中...' : label }}
      <input type="file" style="display:none;" :disabled="disabled" accept="audio/mpeg" ref="uploader" v-audioUpload="this" />
    </label>
    <p class="fz12 gray">{{ tips }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import config from '@/config';
const maxSize = 3 * 1024 * 1024; //3M
axios.defaults.withCredentials = true;
const reqUrl = '/api-marketing/upload-game-music';
export default {
  name: 'dm-upload',
  props: {
    tips: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: '点击上传'
    },
    size: String,
    url: {
      type: String,
      default: '/api-marketing/upload-game-music'
    }
  },
  data() {
    return {
      disabled: false,
      loading: false
    };
  },
  directives: {
    audioUpload: {
      inserted(el, binding) {
        const _vm = binding.value;
        el.addEventListener('change', function() {
          _vm.loading = true;
          if (el.files[0].size > maxSize) {
            _vm.$tips({ type: 'warning', message: '上传不能大于3M' });
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
              console.log(res);
              if (res.data.errorCode === 0) {
                const name = res.data.result.musicName;
                const code = res.data.result.musicFieldCode;
                const url = res.data.result.musicUrl;
                _vm.$emit('sendAduioList', { name, code, url });
                _vm.$tips({ type: 'success', message: '上传成功' });
              } else {
                _vm.$tips({ type: 'error', message: res.data.message || '上传失败' });
              }
            })
            .catch(error => {
              console.log(error);
              _vm.loading = false;
              _vm.$tips({ type: 'error', message: error.msg || '上传失败' });
            });
        });
      }
    }
  }
};
</script>
