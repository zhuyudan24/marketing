<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-date-picker v-model="dateTime" :picker-options="pickerOptions" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="getTableList"></el-date-picker>
      <el-select class="dm-select" clearable="" v-model="listParams.callStatus" placeholder="选择通话状态" @change="getTableList">
        <el-option v-for="(v, i) in callStatusOption" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-select class="dm-select" clearable v-model="listParams.telTaskType" placeholder="选择类型" @change="getTableList">
        <el-option v-for="(v, i) in telTaskTypeOption" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-input v-model="listParams.phoneNumber" class="w200" placeholder="输入号码查询" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button type="primary" class="fr" @click="$router.push('/calllog/record')">录音设置</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading">
      <el-table-column align="left" width="150" prop="callBeginTime" label="呼叫时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.callBeginTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.callBeginTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column align="left" min-width="150" prop="clerkName" label="主叫">
        <template slot-scope="scope">
          <img class="vertical-middle table__avatar--40" :src="scope.row.clerkImage || defaultAvatar" width="60" height="60" alt="" />
          <div class="inline-block vertical-middle">
            <p class="table-name--ellipsis">{{ scope.row.clerkName || '--' }}</p>
            <p class="fz13 gray">{{ scope.row.storeGroupName || '--' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" min-width="150" prop="memberId" label="被叫(会员)">
        <template slot-scope="scope">
          <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.photoUrl)" width="60" height="60" alt="" />
          <div class="inline-block vertical-middle">
            <p class="table-name--ellipsis">{{ scope.row.name || '--' }}</p>
            <p class="fz13 gray">{{ scope.row.phoneNumber || '--' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" width="150" prop="status" label="通话状态">
        <template slot-scope="scope">
          {{ scope.row.callStatus === 1 ? '未接通' : scope.row.callStatus === 2 ? '接通' : '成功' }}
        </template>
      </el-table-column>
      <el-table-column align="left" width="150" prop="status" label="类型">
        <template slot-scope="scope">
          {{ scope.row.telTaskType !== 1 ? scope.row.ecmName : '不良评价回访' }}
        </template>
      </el-table-column>
      <el-table-column align="left" width="150" prop="callTime" label="通话时长（秒）">
        <template slot-scope="scope">
          {{ scope.row.callTime }}秒
        </template>
      </el-table-column>
      <el-table-column align="left" width="150" prop="callFee" label="录音">
        <template slot-scope="scope">
          <span v-if="scope.row.showStatus !== 1">{{ scope.row.description }}</span>
          <a v-else :href="scope.row.showRecordUrl" target="_blank" :title="scope.row.description"><i class="iconfont  icon-xinxixianshi2 pr5"></i>{{ scope.row.description }}</a>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { callLogList } from '@/service/api/calllogApi.js';
import tableMethods from '@/mixins/tableMethods.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  name: 'call-log',
  mixins: [filterAvatar, tableMethods],
  data() {
    const that = this;
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      callStatusOption: [{ value: '', label: '全部' }, { value: 1, label: '未接通' }, { value: 2, label: '接通' }],
      telTaskTypeOption: [{ value: '', label: '全部' }, { value: 1, label: '不良评价回访' }, { value: 2, label: 'ECM话务任务' }],
      listParams: { marketingType: '', sceneSettingId: '', phoneNumber: '', currentPage: 1, pageSize: 20, callStatus: '', telTaskType: '', memberId: '', storeId: '', referId: '' },
      total: 0,
      loading: false,
      tableList: [],
      pickerOptions: {
        onPick({ maxDate, minDate }) {
          if (new Date(maxDate).getTime() - new Date(minDate).getTime() > 90 * 24 * 60 * 60 * 1000) {
            that.$tips({ type: 'warning', message: '时间范围不能大于90天' });
            that.$nextTick(_ => {
              that.dateTime = ['', ''];
            });
          }
        },
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      }
    };
  },
  created() {
    this.$store.commit('aside_handler', false);
    this.$store.commit('mutations_breadcrumb', [{ name: '会员管理', path: '' }, { name: '通话记录', path: '' }]);
    this.getTableList();
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
          <i class="el-icon-info"></i>
          通话录音默认存储3天，如需更长的期限，请在录音设置中开启。
      </div>
    `
    );
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    //列表请求
    async getTableList() {
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      this.loading = true;
      try {
        let res = await callLogList(this.listParams);
        if (res.errorCode === 0) {
          this.tableList = res.result.result || [];
          this.total = res.result.totalCount;
        }
      } catch (err) {
        this.$tips({ type: 'error', message: '请求列表出错' });
      }
      this.loading = false;
    }
  }
};
</script>
