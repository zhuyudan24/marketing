<template>
  <div class="dm-wrap" v-loading="loading">
    <el-form :model="form" :rules="rules" ref="form" label-width="80px" class="demo-ruleForm">
      <el-form-item label="创建时间">
        <p>{{ form.createTimeStr }}</p>
      </el-form-item>
      <el-form-item label="会员信息">
        <img class="vertical-middle table__avatar--40" width="60" height="60" :src="form.thirdImgUrl || defaultAvatar" alt="" />
        <div class="inline-block vertical-middle">
          <p class="line-height1">{{ form.memberName || '--' }}</p>
          <p class="gray fz13">{{ form.thirdNickName || '--' }}</p>
        </div>
      </el-form-item>
      <el-form-item label="反馈详情">
        <p>{{ form.problemContent }}</p>
      </el-form-item>
      <el-form-item label="意见图片" v-if="form.imgs.length > 0">
        <div class="img-box">
          <img v-for="(v, i) in form.imgs" preview="0" preview-text="" :key="i" :src="v.imgUrl" alt="" preview-title-enable="true" preview-nav-enable="true" @mouseover="showImage(v.imgUrl)" />
        </div>
      </el-form-item>
      <el-form-item label="回复内容" prop="handleRemark">
        <dm-input :disabled="isInfo" type="textarea" class="w400" v-model="form.handleRemark" :rows="4" placeholder="请输入回复内容" :maxlength="200"></dm-input>
      </el-form-item>
    </el-form>
    <span class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" v-if="!isInfo" @click="submit('form')">提 交</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </span>
    <vue-gic-img-preview :imgUrl="imgUrl" :imgShowFlag="imgShowFlag" @hideImage="hideImage"></vue-gic-img-preview>
  </div>
</template>
<script>
import { formatDateTimeByType } from '@/utils/index.js';
import { getSuggestionsDetail, handleSuggestions } from '@/service/api/evaluationApi.js';
import filterAvater from '@/mixins/filterAvater.js';

export default {
  name: 'problem',
  mixins: [filterAvater],
  data() {
    return {
      loading: false,
      form: {
        createTimeStr: '',
        memberName: '',
        thirdNickName: '',
        imgs: [],
        problemContent: '',
        handleRemark: ''
      },
      rules: {
        handleRemark: [{ required: true, message: '请输入回复内容', trigger: 'blur' }, { max: 200, message: '字数不能大于200', trigger: 'blur' }]
      },
      isInfo: this.$route.meta.type === 'info',
      imgUrl: '', // 传递的图片 src
      imgShowFlag: false // 是否弹框显示,true: 显示；false: 不显示
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '服务监督', path: '/evaluation' }, { name: '投诉与建议', path: '/evaluation/suggestion' }, { name: '投诉与建议处理', path: '' }]);
    this.getSuggestionsDetail();
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          handleSuggestions({ problemId: this.$route.params.id, content: this.form.handleRemark }).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: '回复成功' });
              this.$router.go(-1);
            } else {
              this.$tips({ type: 'error', message: res.message || '回复失败' });
            }
          });
        } else {
          // this.$tips({type: 'warning', message: '表单填写不规范'})
          return false;
        }
      });
    },
    async getSuggestionsDetail() {
      this.loading = true;
      try {
        let res = await getSuggestionsDetail({ problemId: this.$route.params.id });
        const result = res.result;
        this.form.createTimeStr = formatDateTimeByType(result.createTime, 'yyyy-MM-dd-HH-mm-ss');
        this.form.memberName = result.memberName || '';
        this.form.thirdNickName = result.thirdNickName || '';
        this.form.imgs = result.imgs || [];
        this.form.problemContent = result.problemContent || [];
        this.form.handleRemark = result.handleRemark || '';
        this.form.thirdImgUrl = result.thirdImgUrl || '';
      } catch (err) {
        console.log(err);
      }
      this.loading = false;
    },
    showImage(src) {
      if (!src || src == '') {
        return false;
      }
      this.imgShowFlag = true;
      this.imgUrl = src;
    },
    hideImage(val) {
      this.imgShowFlag = val;
    }
  }
};
</script>

<style lang="scss" scoped>
.img-box {
  max-width: 100%;
  img {
    height: 80px;
    width: auto;
    padding: 0 10px;
    &:first-child {
      padding-left: 0;
    }
  }
}
</style>
