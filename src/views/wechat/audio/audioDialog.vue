<template>
  <el-dialog title="语音管理" :visible.sync="show" width="600px" :before-close="close" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="titleName">
        <dm-input v-model="form.titleName" :maxlength="64"></dm-input>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="form.voiceCategory">
          <el-option v-for="item in dictList" :key="item.dict_id" :label="item.dict_name" :value="item.dict_id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="语音内容" v-if="!this.voiceId">
        <el-upload class="dm-upload_right" :action="api + '/api-marketing/upload-marketing-audiosave'" :on-preview="handlePreview" :data="{ requestProject: 'marketing' }" :on-remove="handleRemove" enctype="multipart/form-data" :on-success="uploadSuccess" :auto-upload="true" :multiple="false" :limit="1" :on-exceed="handleExceed" :before-upload="beforeUpload" :file-list="fileList">
          <el-button size="small" type="primary">上传语音</el-button>
        </el-upload>
        <p class="gray fz12">格式支持mp3、wma、wav、amr，文件大小不超过30M，语音时长不超过30分钟</p>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit('form')">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import config from '@/config';
import { editAudioDetailService, saveAudioService } from '@/service/api/wechatApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    voiceId: String
  },
  watch: {
    show(val) {
      if (val) {
        this.editAudioDetailService({ voiceId: this.voiceId });
      }
    }
  },
  data() {
    return {
      api: config.api,
      loading: false,
      radio: '',
      dictList: [],
      form: { titleName: '', voiceCategory: '' },
      fileList: [],
      rules: {
        titleName: [{ required: true, message: '请输入文件名', trigger: 'change' }]
      },
      voiceMediaId: ''
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
      this.voiceMediaId = '';
    },
    submit(formName) {
      if (!this.voiceId && !this.voiceMediaId) {
        this.$tips({ type: 'warning', message: '请上传语音文件再提交' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveAudioService();
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    async editAudioDetailService(val) {
      try {
        this.loading = true;
        let res = await editAudioDetailService(val);
        this.dictList = res.result.gicDictDtoList;
        this.form.titleName = res.result.wechatVoiceDTO ? res.result.wechatVoiceDTO.titleName : '';
        this.form.voiceCategory = res.result.wechatVoiceDTO ? res.result.wechatVoiceDTO.voiceCategory : '';
        this.voiceMediaId = res.result.wechatVoiceDTO ? res.result.wechatVoiceDTO.voiceMediaId : '';
        this.loading = false;
      } catch (err) {
        console.log(err);
        this.$tips({ type: 'error', message: '初始化失败，请稍后再试' });
        this.loading = false;
      }
    },
    //保存操作
    async saveAudioService() {
      try {
        this.loading = true;
        let params = { voiceId: this.voiceId, titleName: this.form.titleName, voiceCategory: this.form.voiceCategory, voiceMediaId: this.voiceMediaId };
        let res = await saveAudioService(params);
        this.loading = false;
        this.$tips({ type: 'success', message: '保存语音成功' });
        this.$emit('update:show', false);
        this.$emit('refresh');
        console.log(res);
      } catch (err) {
        this.$tips({ type: 'error', message: '保存语音失败' });
      }
    },
    beforeUpload(file) {
      console.log(file);
      if (file.type.indexOf('audio') < 0) {
        this.$tips({ type: 'warning', message: '格式支持mp3、wma、wav、amr，文件大小不超过30M，语音时长不超过30分钟' });
        return false;
      }
    },
    //上传相关
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`只能上传一个文件，请先移除文件`);
    },
    uploadSuccess(response, file, fileList) {
      if (response.errorCode === 0) {
        this.$tips({ type: 'success', message: '上传成功' });
        this.voiceMediaId = response.result;
      } else {
        this.$tips({ type: 'error', message: response.message });
      }
    }
  }
};
</script>
