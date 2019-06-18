<template>
  <el-dialog title="批次记录" :visible.sync="show" width="80%" :before-close="close">
    <div class="pb22 clearfix">
      <el-input v-model="listParams.memberInfo" class="w200" placeholder="输入会员昵称/名字/手机号" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-select class="dm-select" clearable v-model="listParams.success" placeholder="所有条件" @change="search">
        <el-option v-for="(v, i) in successOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-button icon="iconfont icon-icon_yunxiazai" class="fr" type="primary" @click="exportBatchSendDetails"> 导出列表</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" height="400" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column type="index" width="50px" label="序号"></el-table-column>
      <el-table-column v-for="(v, i) in tableHeader" :type="v.type" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
        <template slot-scope="scope">
          <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
          <component v-else-if="v.component" :is="v.component" :row="scope.row"></component>
          <span v-else>{{ scope.row[v.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
    </span>
    <vue-gic-export-excel :appendToBody="true" :dialogVisible.sync="dialogVisible" :dataArr="tableList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </el-dialog>
</template>
<script>
import { ecmBatchSendDetails, exportBatchSendDetails } from '@/service/api/ecmApi.js';
import memberInfo from '@/components/member-info/index.vue';
export default {
  name: 'ecm-batch-list',
  components: {
    'member-info': memberInfo
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    },
    ecmPlanName: {
      type: String,
      default: ''
    },
    execTime: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      successOptions: [{ value: '', label: '发送条件' }, { value: 0, label: '不满足' }, { value: 1, label: '满足' }],
      listParams: {
        ecmPlanQuartzLogId: '',
        success: '',
        memberInfo: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      loading: false,
      tableHeader: [
        { label: '会员信息', prop: 'marketingType', minWidth: '120', align: 'left', component: 'member-info' },
        { label: '手机号码', prop: 'phoneNumber', minWidth: '120', align: 'left' },
        {
          label: '发送条件',
          prop: 'errCode',
          width: '100',
          align: 'left',
          formatter(row) {
            return row.errCode === '0' ? '满足' : '不满足';
          }
        },
        { label: '主门店', prop: 'mainStoreName', minWidth: '120', align: 'left' },
        { label: '专属导购', prop: 'mainClerkName', minWidth: '120', align: 'left' },
        { label: '备注', prop: 'errMsg', minWidth: '120', align: 'left' }
      ],
      tableList: [],
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  watch: {
    show(val) {
      if (val) {
        this.ecmBatchSendDetails();
      }
    }
  },
  methods: {
    search() {
      this.listParams.currentPage = 1;
      this.ecmBatchSendDetails();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.ecmBatchSendDetails();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.ecmBatchSendDetails();
    },
    async ecmBatchSendDetails() {
      this.loading = true;
      this.listParams.ecmPlanQuartzLogId = this.id;
      let res = await ecmBatchSendDetails(this.listParams);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    close() {
      this.$emit('update:show', false);
    },
    exportBatchSendDetails() {
      this.dialogVisible = true;
      this.excelUrl = exportBatchSendDetails;
      this.params = {
        memberInfo: this.listParams.memberInfo,
        success: this.listParams.success,
        ecmPlanName: this.ecmPlanName,
        execTime: this.execTime,
        ecmPlanQuartzLogId: this.id,
        requestProject: 'marketing'
      };
    }
  }
};
</script>
