<template>
  <section class="dm-wrap">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      <el-form-item label="标题" prop="titleName" class="w450">
        <dm-input v-model="form.titleName" :maxlength="64"></dm-input>
      </el-form-item>
      <el-form-item label="分类" class="w450">
        <el-select v-model="form.videoCategory">
          <el-option v-for="item in dictList" :key="item.dict_id" :label="item.dict_name" :value="item.dict_id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标签" prop="videoTags" class="w450">
        <dm-input v-model="form.videoTags" :maxlength="10"></dm-input>
      </el-form-item>
      <el-form-item label="简介" prop="remark" class="w450">
        <dm-input type="textarea" v-model="form.remark" :rows="4" :maxlength="120"></dm-input>
      </el-form-item>
      <el-form-item label="视频内容" v-if="!this.videoId">
        <el-upload v-show="form.remark && form.titleName" class="dm-upload_right" :action="api + '/api-marketing/upload-marketing-videosave'" :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" enctype="multipart/form-data" :on-success="uploadSuccess" :auto-upload="true" :multiple="false" :limit="1" :data="{ titleName: form.titleName, remark: form.remark, requestProject: 'marketing' }" :on-exceed="handleExceed" :file-list="fileList">
          <el-button size="small" type="primary" :disabled="!(form.remark && form.titleName)">上传视频</el-button>
        </el-upload>
        <el-button size="small" v-show="!(form.remark && form.titleName)" type="primary" @click="tips">上传视频</el-button>
        <p class="gray fz12 line-height2">视频不能超过20M，支持大部分主流视频格式，超过20M的视频可至<a href="http://v.qq.com/" target="_blank">腾讯视频</a>上传后添加</p>
      </el-form-item>
      <p class="gray text-center pb10 pt20">不得上传未经授权的他人作品，以及色情、反动等违法视频。</p>
      <p class="gray text-center"><el-checkbox v-model="checked" class="pr10"></el-checkbox>我已阅读并同意<a href="http://v.qq.com/help/help_agreement.html" target="_blank">《腾讯视频上传服务规则》</a></p>
    </el-form>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" :disabled="!checked" @click="submit('form')">确 定</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </section>
</template>
<script>
import config from '@/config';
import { editVideoDetailService, saveVideoService } from '@/service/api/wechatApi.js';
export default {
  created() {
    this.editVideoDetailService();
    if (this.$route.meta.type === 'edit') {
      this.checked = true;
    }
  },
  data() {
    return {
      api: config.api,
      loading: false,
      radio: '',
      dictList: [],
      form: { titleName: '', videoCategory: '', videoTags: '', remark: '' },
      fileList: [],
      rules: {
        titleName: [{ required: true, message: '请输入文件名', trigger: 'change' }],
        remark: [{ required: true, message: '请输入文件名', trigger: 'change' }]
      },
      videoMediaId: '',
      videoUrl: '',
      checked: false,
      videoId: this.$route.params.id
    };
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  methods: {
    tips() {
      this.$tips({ type: 'warning', message: '请先填写标题和简介再进行上传' });
    },
    submit(formName) {
      if (!this.videoId && !this.videoMediaId) {
        this.$tips({ type: 'warning', message: '请上传视频文件再提交' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveVideoService();
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    async editVideoDetailService() {
      try {
        this.loading = true;
        let res = await editVideoDetailService({ videoId: this.videoId });
        this.dictList = res.result.gicDictDtoList;
        this.form.titleName = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.titleName : '';
        this.form.videoCategory = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.videoCategory : '';
        this.form.videoTags = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.videoTags : '';
        this.form.remark = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.remark : '';
        this.videoMediaId = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.videoMediaId : '';
        this.videoUrl = res.result.wechatVideoDTO ? res.result.wechatVideoDTO.videoUrl : '';
        this.loading = false;
      } catch (err) {
        console.log(err);
        this.$tips({ type: 'error', message: '初始化失败，请稍后再试' });
        this.loading = false;
      }
    },
    //保存操作
    async saveVideoService() {
      try {
        this.loading = true;
        let params = {
          videoId: this.videoId,
          titleName: this.form.titleName,
          videoTags: this.form.videoTags,
          videoCategory: this.form.videoCategory,
          remark: this.form.remark,
          videoMediaId: this.videoMediaId,
          videoUrl: this.videoUrl
        };
        let res = await saveVideoService(params);
        if (res.errorCode === 0) {
          this.loading = false;
          this.$tips({ type: 'success', message: '保存视频成功' });
          this.$router.go(-1);
        } else {
          this.$tips({ type: 'error', message: '保存视频失败' });
        }
      } catch (err) {
        this.loading = false;
        this.$tips({ type: 'error', message: '保存视频失败' });
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
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    uploadSuccess(response, file, fileList) {
      if (response.errorCode === 0) {
        this.$tips({ type: 'warning', message: '上传成功' });
        this.videoMediaId = response.result.media_id;
        this.videoUrl = response.result.url;
      } else {
        this.$tips({ type: 'warning', message: response.message });
      }
    }
  }
};
</script>
