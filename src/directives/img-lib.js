import axios from 'axios';
import config from '@/config';
const maxSize = 2 * 1024 * 1024; //5M
axios.defaults.withCredentials = true;

export default {
  inserted(el, binding) {
    el.addEventListener('change', function() {
      if (el.files[0].size > maxSize) {
        binding.value.$tips({ type: 'warning', message: '上传图片不能大于2M' });
        return;
      }
      binding.value.upLoadDisabled = true;
      let formData = new FormData();
      formData.append('file', el.files[0]);
      formData.append('requestProject', 'gic-web');
      formData.append('wechatImageGroupId', binding.value.listParams.wechatImageGroupId || 1);
      axios
        .post(config.api + '/api-marketing/marketing-wechat-image-save', formData)
        .then(res => {
          if (res.data.errorCode === 0) {
            binding.value.$tips({ type: 'success', message: '上传成功' });
            binding.value.loadImgList();
          } else {
            binding.value.$tips({ type: 'error', message: res.data.message || '上传失败' });
          }
          binding.value.upLoadDisabled = false;
        })
        .catch(error => {
          binding.value.upLoadDisabled = false;
          binding.value.$tips({ type: 'error', message: error.msg || '上传失败' });
        });
    });
  }
};
