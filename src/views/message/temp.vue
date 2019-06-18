<template>
  <section class="dm-wrap">
    <div class="pb10">
      <el-select class="dm-select" v-model="listParams.type" placeholder="选择营销场景" @change="search">
        <el-option v-for="(v, i) in libTypeOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-date-picker class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="search"></el-date-picker>
      <el-input v-model="listParams.content" class="w200" placeholder="输入模板名称/ID/内容" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="addTemp">新建短信模板</el-button>
      <span class="fr pt10 pr20">
        <el-tooltip effect="dark" placement="top" content="审核失败不占用模板数，删除模板可释放占用模板数。如需更多的短信模板请联系GIC运营。">
          <i class="iconfont icon-xinxixianshi pl5 gray"></i>
        </el-tooltip>
        <span class="gray fz13">可用模板数： {{ allUsableCount }} | 已用模板数：{{ usedCount }}</span>
      </span>
    </div>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="12" v-for="(v, i) in smsTempList" :key="i">
        <div class="sms-lib-item border1">
          <div class="sms-lib-item_top">模板名称：{{ v.title }}（ID:{{ v.templateId }}）</div>
          <div class="sms-lib-item_body">
            <p class="danger-color" v-if="v.status === 2"><i class="el-icon-warning"></i> {{ v.auditResult }}</p>
            <p>{{ v.content }}</p>
          </div>
          <div class="sms-lib-item_bottom clearfix">
            <div class="fl">
              <span>{{ v.addUserName }}</span>
              <span>创建于 {{ formatDateTimeByType(v.createTime, 'yyyy-MM-dd-HH-mm-ss') }}</span>
            </div>
            <div class="fr">
              <el-button type="text" v-if="v.status === 2" @click="$router.push('/message/temp/edit/' + v.smsTemplateId)">修改</el-button>
              <dm-delete @confirm="delData(v)" tips="是否删除该短信模板?">
                <el-button type="text">删除</el-button>
              </dm-delete>
            </div>
          </div>
          <span class="sms-lib-item-tips_right danger-color-bg" v-if="v.status === 2">未通过</span>
          <span class="sms-lib-item-tips_right warning-color-bg" v-if="v.status === 1">审核中</span>
          <span class="sms-lib-item-tips_right success-color-bg" v-if="v.status === 0">已通过</span>
        </div>
      </el-col>
    </el-row>
    <div class="text-center" v-if="smsTempList.length === 0">
      <img class="block block-center pt100" width="60" height="60" src="../../assets/img/no-data_icon.png" alt="" />
      <el-button class="block block-center mt10" type="text" @click="$router.push('/message/temp/add')">新建短信模板</el-button>
    </div>
    <el-pagination v-show="smsTempList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { formatDateTimeByType } from '@/utils/index.js';
import { LoadLibList, delTempService } from '@/service/api/messageApi.js';
export default {
  name: 'sms-lib',
  data() {
    return {
      formatDateTimeByType,
      loading: false,
      smsTempList: [],
      libTypeOptions: [{ value: '', label: '全部' }, { value: 0, label: '普通短信模板' }, { value: 1, label: '营销短信模板' }, { value: 2, label: '验证码模板' }],
      listParams: {
        type: '',
        content: '',
        currentPage: 1,
        pageSize: 20,
        startTime: '',
        endTime: ''
      },
      total: 0,
      allUsableCount: 0,
      usedCount: 0,
      dateTime: []
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '' }, { name: '模板库', path: '' }]);
    this.LoadLibList();
  },
  methods: {
    search() {
      this.listParams.currentPage = 1;
      this.LoadLibList();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.LoadLibList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.LoadLibList();
    },
    async LoadLibList() {
      this.loading = true;
      if (this.dateTime) {
        this.listParams.startTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.startTime = this.listParams.endTime = '';
      }
      try {
        let res = await LoadLibList(this.listParams);
        if (res.errorCode === 0 && res.result) {
          this.smsTempList = res.result.result || [];
          this.allUsableCount = res.result.params.allUsableCount || 0;
          this.usedCount = res.result.params.usedCount || 0;
          this.total = res.result.totalCount;
        } else {
          this.smsTempList = [];
          this.total = 0;
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },
    addTemp() {
      if (this.usedCount >= this.allUsableCount) {
        this.$alert(
          `<div>
        <i class="el-icon-warning warning-color fz30 vertical-middle mr20"></i>
        <p class="inline-block vertical-middle w300">已超过可用短信模板数量，请删除不用短信模板释放数量或直接与GIC运营联系。</p>
        </div>`,
          '提示',
          {
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: '关 闭'
          }
        );
      } else {
        this.$router.push('/message/temp/add');
      }
    },
    delData(row) {
      delTempService({ templateId: row.templateId, smsTemplateId: row.smsTemplateId }).then(res => {
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '删除成功!' });
          this.LoadLibList();
        } else {
          this.$tips({ type: 'error', message: '删除失败!' });
        }
      });
    }
  }
};
</script>
<style scoped lang="scss">
.sms-lib-item {
  position: relative;
  margin: 10px 0;
  overflow: hidden;
  &_top {
    height: 50px;
    line-height: 50px;
    margin: 0 15px;
  }
  &_body {
    height: 70px;
    overflow-y: auto;
    line-height: 1.5;
    margin: 0 15px;
    padding: 10px;
    background: #f5f8fa;
    font-size: 13px;
  }
  &_bottom {
    margin: 0 15px;
    height: 50px;
    line-height: 50px;
  }
  &-tips_right {
    position: absolute;
    right: 0;
    top: 0;
    padding: 5px 10px;
    color: #fff;
  }
}
</style>
