<template>
  <section class="suggestion dm-wrap">
    <div class="clearfix pb22">
      <span class="pr10">共{{ total }}条投诉与建议</span>
      <el-select class="w200" v-model="listParams.status" placeholder="选择状态" @change="search">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-date-picker class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="search"></el-date-picker>
      <el-input v-model="listParams.storeSearch" class="w200" placeholder="门店名称/code" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-input v-model="listParams.memberSearch" class="w200" placeholder="会员昵称/手机号" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button icon="iconfont icon-icon_yunxiazai fz14" class="fr" type="primary" @click="exportSuggestionExcel"> 下载Excel</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column :show-overflow-tooltip="true" min-width="120" align="left" :key="Math.random()" prop="createTime" label="评价时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="200" align="left" :key="Math.random()" prop="storeName" label="门店">
        <template slot-scope="scope">
          <p>{{ scope.row.storeName || '--' }}</p>
          <p class="fz13 gray">{{ scope.row.storeGroupName || '--' }}</p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="200" header-align="left" align="left" :key="Math.random()" prop="memberId" label="会员信息">
        <template slot-scope="scope">
          <a :href="`${window.location.origin}/member/#/wechatmemberDetail?memberId=${scope.row.memberId}`" target="_blank">
            <img class="vertical-middle table__avatar--40" :src="scope.row.thirdImgUrl || defaultAvatar" width="60" height="60" />
            <div class="inline-block vertical-middle">
              <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
              <p class="fz13 gray">{{ scope.row.phoneNumber || '--' }}</p>
            </div>
          </a>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" min-width="200" header-align="left" align="left" :key="Math.random()" prop="problemContent" label="内容概览">
        <template slot-scope="scope">
          <el-popover class="item" trigger="hover" width="200" v-if="scope.row.problemContent" :content="scope.row.problemContent" placement="top-start">
            <span class="ellipsis" slot="reference"><i v-if="scope.row.imgs.length > 0" class="el-icon-picture fz16 primary-color" />{{ scope.row.problemContent }}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="140px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status === 1" @click="$router.push('/evaluation/suggestion/' + scope.row.problemId)">立即处理</el-button>
          <el-button type="text" v-else-if="scope.row.status === 4" @click="$router.push('/evaluation/suggestion/info/' + scope.row.problemId)">已解决</el-button>
          <span type="text" v-else>--</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="tableList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { pageSuggestionsList, exportProblemsCsv } from '@/service/api/evaluationApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvater from '@/mixins/filterAvater.js';
export default {
  name: 'suggestion',
  mixins: [filterAvater],
  data() {
    return {
      window: window,
      formatDateTimeByType,
      loading: false,
      tableList: [],
      dateTime: [Date.now() - 3 * 30 * 24 * 60 * 60 * 1000, Date.now()],
      listParams: {
        status: '',
        currentPage: 1, //是	Number	当前页面
        pageSize: 20, //是	Number	每页显示条数
        beginTime: '',
        endTime: '',
        storeSearch: '',
        memberSearch: ''
      },
      statusOptions: [{ value: '', label: '所有' }, { value: 1, label: '待处理' }, { value: 4, label: '已解决' }],
      total: 0,
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.listParams.status = Number(this.$route.query.status) || '';

    this.pageSuggestionsList();
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '服务监督', path: '/evaluation' }, { name: '投诉与建议', path: '/suggestion' }]);
  },
  methods: {
    search() {
      this.listParams.currentPage = 1;
      this.pageSuggestionsList();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.pageSuggestionsList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.pageSuggestionsList();
    },
    async pageSuggestionsList() {
      this.formatterTimeFunc();
      try {
        this.loading = true;
        let res = await pageSuggestionsList(this.listParams);
        if (res.errorCode === 0 && res.result) {
          this.tableList = res.result.result || [];
          this.total = res.result.totalCount;
        } else {
          this.tableList = [];
          this.total = 0;
        }
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },

    exportSuggestionExcel() {
      this.formatterTimeFunc();
      if (!this.listParams.beginTime || !this.listParams.endTime) {
        this.$tips({ type: 'warning', message: '时间不能为空' });
        return;
      }
      this.dialogVisible = true;
      this.excelUrl = exportProblemsCsv;
      this.params = {
        storeSearch: this.listParams.storeSearch,
        memberSearch: this.listParams.memberSearch,
        status: this.listParams.status,
        beginTime: this.listParams.beginTime,
        endTime: this.listParams.endTime,
        requestProject: 'marketing'
      };
    },
    formatterTimeFunc() {
      if (!this.dateTime) {
        this.listParams.beginTime = this.listParams.endDate = '';
      } else {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      }
    }
  }
};
</script>
