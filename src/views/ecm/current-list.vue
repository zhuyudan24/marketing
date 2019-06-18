<template>
  <section>
    <div class="dm-wrap clearfix">
      <el-date-picker class="w250" v-model="dateTime" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="search"></el-date-picker>
      <el-select class="dm-select" clearable v-model="listParams.success" placeholder="所有条件" @change="search">
        <el-option v-for="(v, i) in successOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-input v-model="listParams.memberInfo" class="w250" placeholder="输入会员昵称/名字/手机号" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button icon="iconfont icon-icon_yunxiazai" class="fr" type="primary" @click="exportCurrentSendDetails"> 导出列表</el-button>
    </div>
    <div class="dm-wrap">
      <el-table ref="multipleTable" tooltipEffect="light" :data="infoList" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column v-for="(v, i) in infoHeader" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
          <template slot-scope="scope">
            <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
            <component v-else-if="v.component" :is="v.component"></component>
            <span v-else>{{ scope.row[v.prop] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发送时间" align="left" width="120" prop="createTime">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="dm-wrap">
      <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column v-for="(v, i) in tableHeader" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
          <template slot-scope="scope">
            <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
            <component v-else-if="v.component" :is="v.component" :row="scope.row"></component>
            <span v-else>{{ scope.row[v.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-show="infoList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    </div>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="tableList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { ecmCurrentSendInfos, ecmCurrentSendDetails, exportCurrentSendDetails } from '@/service/api/ecmApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import memberInfo from '@/components/member-info/index.vue';
const typeOptions = [{ value: '', label: '所有类型' }, { value: 'teletext', label: '图文' }, { value: 'text', label: '文本' }, { value: 'image', label: '图片' }, { value: 'card', label: '卡券' }, { value: 'wxa', label: '小程序' }, { value: 'message', label: '短信' }, { value: 'teltask', label: '话务' }];
export default {
  name: 'ecm-current-list',
  components: {
    'member-info': memberInfo
  },
  data() {
    return {
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      successOptions: [{ value: '', label: '所有状态' }, { value: 1, label: '成功' }, { value: 0, label: '失败' }],
      listParams: {
        ecmPlanId: this.$route.params.id,
        ecmMarketingTypeRelationIds: '',
        currentPage: 1,
        pageSize: 20,
        memberInfo: '',
        success: '',
        beginTime: '',
        endTime: ''
      },
      total: 0,
      loading: false,
      infoHeader: [
        {
          label: '回复方式',
          prop: 'marketingType',
          align: 'left',
          formatter(row) {
            let result = '--';
            typeOptions.map(v => {
              if (v.value === row.marketingType) {
                result = v.label;
              }
            });
            return result;
          }
        },
        { label: '发送内容', prop: 'title', align: 'left' },
        { label: '应发数量', prop: 'sendCount', align: 'left' },
        { label: '成功发送', prop: 'successCount', align: 'left' },
        { label: '发送失败', prop: 'failedCount', align: 'left' },
        {
          label: '使用状态',
          prop: 'status',
          align: 'left',
          formatter(row) {
            return row.status ? '<span class="dm-status--primary">正在使用</span>' : '<span class="dm-status--info">已删除</span>';
          }
        }
      ],
      infoList: [],
      tableList: [],
      tableHeader: [
        { label: '回复信息', prop: 'title', minWidth: '120', align: 'left' },
        // {
        //   label: '发送时间',
        //   prop: 'createTime',
        //   minWidth: '120',
        //   align: 'left',
        //   formatter(row) {
        //     const date = formatDateTimeByType(row.createTime, 'yyyy-MM-dd-HH-mm', true);
        //     return date.y + '\n' + date.h;
        //   }
        // },
        { label: '会员信息', prop: 'marketingType', minWidth: '120', align: 'left', component: 'member-info' },
        { label: '手机号码', prop: 'phoneNumber', minWidth: '120', align: 'left' },
        { label: '主门店', prop: 'mainStoreName', minWidth: '120', align: 'left' },
        { label: '专属导购', prop: 'mainClerkName', minWidth: '120', align: 'left' },
        {
          label: '状态',
          prop: 'errCode',
          width: '100',
          align: 'left',
          formatter(row) {
            return row.errCode === '0' ? '<span class="dm-status--success">成功</span>' : '<span class="dm-status--erroe">失败</span>';
          }
        },
        { label: '备注', prop: 'errMsg', minWidth: '120', align: 'left' }
      ],
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.ecmCurrentSendInfos();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '智能营销', path: '/ecm' }, { name: this.$route.params.name + ' - 实时发送记录', path: '' }]);
    this.$store.commit('mutations_layoutTips', `<div class="layout--tips"><i class="el-icon-info"></i>历史数据限制：2018年11月15日之前的历史营销计划，没有详细数据</div>`);
    setTimeout(_ => {
      this.$store.commit('mutations_layoutTips', '');
    }, 5000);
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    formatDateTimeByType,
    handleSelectionChange(val) {
      let list = val
        .map(v => v.ecmMarketingTypeRelationId)
        .filter(v => v)
        .join(',');
      this.listParams.ecmMarketingTypeRelationIds = list;
      this.ecmCurrentSendDetails();
    },
    search() {
      this.listParams.currentPage = 1;
      this.ecmCurrentSendInfos();
      // this.ecmCurrentSendDetails();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.ecmCurrentSendDetails();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.ecmCurrentSendDetails();
    },
    // 上面列表
    async ecmCurrentSendInfos() {
      this.loading = true;
      this.formatterTimeFunc();
      let res = await ecmCurrentSendInfos({
        ecmPlanId: this.$route.params.id,
        beginTime: this.listParams.beginTime,
        endTime: this.listParams.endTime,
        memberInfo: this.listParams.memberInfo,
        success: this.listParams.success
      });
      this.infoList = res.result || [];
      this.$nextTick(_ => {
        this.$refs.multipleTable.toggleAllSelection();
      });
      let list = this.infoList
        .map(v => v.ecmMarketingTypeRelationId)
        .filter(v => v)
        .join(',');
      this.listParams.ecmMarketingTypeRelationIds = list;
      this.loading = false;
    },
    // 下面列表
    async ecmCurrentSendDetails() {
      this.loading = true;
      this.formatterTimeFunc();
      let res = await ecmCurrentSendDetails(this.listParams);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount || 0;
      this.loading = false;
    },
    // 导出
    exportCurrentSendDetails() {
      this.dialogVisible = true;
      this.excelUrl = exportCurrentSendDetails;
      this.formatterTimeFunc();
      this.params = {
        memberInfo: this.listParams.memberInfo,
        success: this.listParams.success,
        ecmPlanId: this.listParams.ecmPlanId,
        ecmPlanName: this.$route.params.name,
        beginTime: this.listParams.beginTime,
        endTime: this.listParams.endTime,
        ecmMarketingTypeRelationIds: this.listParams.ecmMarketingTypeRelationIds,
        requestProject: 'marketing'
      };
    },
    /*-----------辅助方法-------------*/
    formatterTimeFunc() {
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = this.listParams.senendTimedEndTime = '';
      }
    }
  }
};
</script>
