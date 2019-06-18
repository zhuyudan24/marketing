/**
 * v-upload 图片上传
 */

import axios from 'axios';
import config from '@/config';
axios.defaults.withCredentials = true;

function verificationPicFile(file, l_width, l_height) {
  return new Promise((resolve, reject) => {
    const filePath = file.value;
    if (filePath) {
      //读取图片数据
      const filePic = file.files[0];
      let reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        //加载图片获取图片真实宽度和高度
        var image = new Image();
        image.onload = function() {
          var width = image.width;
          var height = image.height;
          if (width === l_width && height === l_height) {
            resolve();
          } else {
            file.value = '';
            reject(new Error(`上传图片尺寸应为${l_width}*${l_height}`));
          }
        };
        image.src = data;
      };
      reader.readAsDataURL(filePic);
    } else {
      reject();
    }
  });
}

export default {
  inserted: function(el, binding) {
    el.addEventListener('change', function() {
      binding.value.loading = true;
      const size = binding.value.limit && binding.value.limit.maxSize ? binding.value.limit.maxSize : 2; // 默认最大2M限制
      if (el.files[0].size > size * 1024 * 1024) {
        binding.value.$tips({ type: 'warning', message: `上传图片不能大于${size}M` });
        binding.value.loading = false;
        return;
      }
      // 启用限制图片宽高大小
      if (binding.value.limit && binding.value.limit.type) {
        const { width, height } = binding.value.limit;
        verificationPicFile(el, width, height)
          .then(res => {
            upload();
          })
          .catch(err => {
            binding.value.$tips({ type: 'warning', message: err.message });
            binding.value.loading = false;
          });
      } else {
        upload();
      }

      function upload() {
        binding.value.disabled = true;

        let formData = new FormData();
        formData.append(binding.value.fileType, el.files[0]);
        formData.append('requestProject', 'gic-web');
        axios
          .post(config.api + binding.value.url, formData)
          .then(res => {
            binding.value.loading = false;
            el.value = '';
            if (res.data.errorCode === 0) {
              if (binding.value.url === '/api-plug/upload-img') {
                (binding.value.model.code = res.data.result[0].imageFiledCode), (binding.value.model.imgUrl = res.data.result[0].qcloudImageUrl);
              } else {
                (binding.value.model.code = res.data.result.imageFiledCode), (binding.value.model.imgUrl = res.data.result.qcloudImageUrl);
                binding.value.model.mediaId = res.data.result.imageMediaId;
                binding.value.model.wxImg = res.data.result.wxImg || res.data.result.imageUrl || '';
              }
              binding.value.$tips({ type: 'success', message: '上传成功' });
            } else {
              binding.value.$tips({ type: 'error', message: res.data.message || '上传失败' });
            }
            binding.value.disabled = false;
          })
          .catch(error => {
            binding.value.loading = false;
            binding.value.disabled = false;
            binding.value.$tips({ type: 'error', message: error.msg || '上传失败' });
          });
      }
    });
  }
};
