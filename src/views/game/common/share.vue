<template>
  <section class="dm-form__wrap">
    <h3 class="dm-title__label">分享设置</h3>
    <el-form-item label="分享设置" class="width50 is-required">
      <el-radio-group v-model="form.shareFlag">
        <el-radio :label="1">可分享</el-radio>
        <el-radio :label="0">不可分享</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="form.shareFlag === 1" label="分享图" prop="shareImg.imgUrl" class="width50" :rules="{ required: true, message: '请上传分享图片', trigger: 'blur' }">
      <dm-upload-avatar :limit="{ maxSize: 1 }" :model.sync="form.shareImg" fileType="fileShare" label="上传图片" tips="图片建议尺寸：200*200，格式为jpg/png/gif。图片大小不超过1MB，点击图片可重新上传。" :disabled="isInfo"></dm-upload-avatar>
    </el-form-item>
    <el-form-item v-if="form.shareFlag === 1" label="分享标题" prop="shareTitle" class="width50" :rules="{ required: true, message: '标题不能为空', trigger: 'blur' }">
      <dm-input v-model="form.shareTitle" class="w400" placeholder="请输入分享标题" :disabled="isInfo" :maxlength="20"></dm-input>
    </el-form-item>
    <el-form-item v-if="form.shareFlag === 1" label="分享描述" prop="shareTextInfo" class="width50" :rules="{ required: true, message: '描述不能为空', trigger: 'blur' }">
      <dm-input type="textarea" class="w400" :rows="4" v-model="form.shareTextInfo" placeholder="请输入分享描述" :disabled="isInfo" :maxlength="50"></dm-input>
    </el-form-item>
  </section>
</template>

<script>
import dmUploadAvatar from '@/components/upload/avatar';
export default {
  props: {
    form: {
      type: Object,
      default() {
        return {
          shareFlag: 1,
          shareTitle: '',
          shareTextInfo: '',
          shareImg: {
            code: '',
            imgUrl: '', // eslint-disable-line
            wxImg: ''
          }
        };
      }
    },
    ruleShareChange: {
      type: Function
    },
    isInfo: {
      type: Boolean,
      default: false
    }
  },
  // watch: {},
  components: {
    dmUploadAvatar
  }
};
</script>
