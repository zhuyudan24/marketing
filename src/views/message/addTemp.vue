<template>
  <div class="dm-wrap" v-loading="loading">
    <el-row :gutter="20" class="sms-temp__tipsT">
      <el-col :span="24">
        <p style="color:#1890ff;">1.长度不要超过450字(汉字，字符，数字等可见符号，都按1个字计算)。单条短信长度为70字，超过70字后，按67字/条分割成多条，以长短信的方式发送给用户，即用户收到的是一条长短信，但是按多条计费</p>
        <p>2.营销类短信，请在短信内容后面增加<span style="color:#1890ff;">“回T退订”</span></p>
        <p>3.短信模板内容不能含有【】符号</p>
        <p>4.不能发送房产、移民、贷款、政治、色情、暴力等违法类短信</p>
        <p>5.短信内容中不能输入Enter/换行，否则将导致短信分条发送</p>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mt20">
      <el-form label-width="80px" ref="form" :model="form" :rules="rules">
        <el-col :span="12">
          <el-form-item label="模板名称" prop="title">
            <dm-input v-model="form.title" :maxlength="10"></dm-input>
          </el-form-item>
          <el-form-item label="短信类型" prop="type">
            <el-select v-model="form.type">
              <el-option v-for="(v, i) in typeOptions" :key="i" :value="v.value" :label="v.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="短信内容" prop="content" class="pb10">
            <dm-input type="textarea" :rows="4" v-model="form.content" :maxlength="450"></dm-input>
          </el-form-item>
          <el-form-item label="申请说明" prop="remark">
            <dm-input type="textarea" :rows="4" v-model="form.remark" :maxlength="120"></dm-input>
          </el-form-item>
        </el-col>
      </el-form>
      <el-col :span="12" class="sms-temp__tips clearfix">
        <div>模板示列如下，其中{数字}为可插入的变量值，参照表如下：注意考虑变量值的文本长度，以免超出67字/条的文本上限。</div>
        <ul class="fl">
          <li>{1}={姓名}</li>
          <li>{2}={姓名+先生/女士}</li>
          <li>{3}={生日日期}</li>
          <li>{4}={生日天数}</li>
          <li>{5}={关注日期}</li>
          <li>{6}={关注天数}</li>
          <li>{7}={主门店品牌名称}</li>
          <li>{8}={主门店名称}</li>
          <li>{9}={主门店电话}</li>
          <li>{10}={专属导购姓名}</li>
          <li>{11}={专属导购手机号}</li>
          <li>{12}={开卡日期}</li>
          <li>{13}={开卡天数}</li>
          <li>{14}={开卡门店名称}</li>
        </ul>
        <ul class="fl">
          <li>{15}={会员卡号}</li>
          <li>{16}={会员等级名称}</li>
          <li>{17}={主门店地址}</li>
          <li>{18}={会员等级剩余有效天数}</li>
          <li>{19}={积分余额}</li>
          <li>{20}={30天内将过期积分额度}</li>
          <li>{21}={储值余额}</li>
          <li>{22}={消费总额}</li>
          <li>{23}={消费次数}</li>
          <li>{24}={最近消费日期}</li>
          <li>{25}={最近消费间隔}</li>
          <li>{26}={最高单笔消费}</li>
          <li>{27}={最近消费门店名称}</li>
          <li>{28}={最近消费品牌名称}</li>
        </ul>
      </el-col>
    </el-row>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="submit('form')">提 交</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </div>
</template>
<script>
import { saveTempService, LoadTempInfo } from '@/service/api/messageApi.js';
export default {
  name: 'add-temp',
  data() {
    return {
      loading: false,
      form: {
        smsRecordlateId: '',
        title: '',
        type: '',
        content: '',
        remark: ''
      },
      typeOptions: [{ value: 0, label: '普通短信' }, { value: 1, label: '营销短信' }, { value: 2, label: '验证码短信' }],
      rules: {
        title: { required: true, message: '请输入模板名称', trigger: 'blur' },
        type: { required: true, message: '请选择短信类型', trigger: 'blur' },
        content: { required: true, message: '请输入短信内容', trigger: 'blur' },
        remark: { required: true, message: '请输入申请说明', trigger: 'blur' }
      },
      editFlag: this.$route.meta.type === 'edit'
    };
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  created() {
    if (this.editFlag) {
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '' }, { name: '模板库', path: '/message/temp' }, { name: '编辑模板', path: '' }]);
      this.LoadTempInfo();
    } else {
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '' }, { name: '模板库', path: '/message/temp' }, { name: '新增模板', path: '' }]);
    }
  },
  methods: {
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveTempService();
        } else {
          return false;
        }
      });
    },
    async saveTempService() {
      try {
        this.loading = true;
        await saveTempService(this.form);
        this.$tips({ type: 'success', message: '操作成功' });
        this.$router.push('/message/temp');
        this.loading = false;
      } catch (err) {
        this.$tips({ type: 'error', message: '操作失败' });
        this.loading = false;
      }
    },
    async LoadTempInfo() {
      this.loading = true;
      let res = await LoadTempInfo({ smsTemplateId: this.$route.params.id });
      this.form = {
        smsTemplateId: res.result.smsTemplateId,
        type: res.result.type,
        content: res.result.content,
        remark: res.result.remark,
        title: res.result.title
      };
      this.loading = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.sms-temp__tips {
  padding: 8px 16px;
  line-height: 23px;
  font-size: 12px;
  background: #f4f4f5;
  ul {
    padding-right: 20px;
    li {
      font-size: 12px;
    }
  }
}
.sms-temp__tipsT {
  background: #f4f4f5;
  padding: 8px 16px;
  p {
    line-height: 1.5;
    font-size: 12px;
    color: #606266;
  }
}
</style>
