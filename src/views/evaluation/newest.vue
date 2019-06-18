<template>
  <section class="eval-newest dm-wrap">
    <div class="clearfix pb22">
      <store-group width="240" class="pr5" :model="storeGroupData" @commit-store="getStoreGroup"></store-group>
      <el-date-picker v-if="$route.meta.type !== 'bad'" class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="refresh"></el-date-picker>
      <el-input v-model="listParams.searchName" class="w300" placeholder="订单号/门店名称/会员姓名/卡号" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button icon="iconfont icon-icon_yunxiazai fz14" v-if="$route.meta.type !== 'bad'" class="fr" type="primary" @click="exportLatestEvaluate"> 下载Excel</el-button>
    </div>
    <div class="filter--box">
      <el-select size="small" v-if="$route.meta.type === 'bad'" class="vertical-middle pl10 w150" v-model="badStatus" placeholder="选择差评类型" @change="$router.push('/evaluation/bad/' + badStatus)">
        <el-option v-for="item in badOptions" :key="item.msg" :label="item.msg" :value="item.msg"></el-option>
      </el-select>
      <el-select size="small" class="vertical-middle pl10 w150" v-model="listParams.visiteStatus" placeholder="选择发送状态" @change="refresh">
        <el-option v-for="item in visiteStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-checkbox class="vertical-middle" size="small" border v-if="$route.meta.type !== 'bad'" :true-label="1" :false-label="0" v-model="listParams.isBad" @change="refresh">不良评价</el-checkbox>
      <el-checkbox class="vertical-middle" size="small" border v-if="$route.meta.type !== 'bad'" :true-label="1" :false-label="0" v-model="listParams.isContent" @change="refresh">有评语</el-checkbox>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column :show-overflow-tooltip="false" width="90" align="left" prop="showStatus" fixed="left" label="服务号显示">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.showStatus" :active-value="1" :inactive-value="0" @change="changeShow(scope.row)"> </el-switch>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" width="160" align="left" prop="createTime" label="评价时间">
        <template slot-scope="scope">
          <p>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm') }}</p>
          <p class="fz13 gray">订单号:{{ scope.row.orderNumber }}</p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" :min-width="140" align="left" prop="storeName" label="门店">
        <template slot-scope="scope">
          <p>{{ scope.row.storeName || '--' }}</p>
          <p class="fz13 gray">{{ scope.row.areaName || '--' }}</p>
        </template>
      </el-table-column>

      <el-table-column min-width="140" header-align="left" align="left" prop="clerkId" label="导购信息">
        <template slot-scope="scope">
          <div class="ellipsis-100">
            <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.clerkImage)" width="60" height="60" />
            <div class="inline-block vertical-middle">
              <p class="table-name--ellipsis">{{ scope.row.clerkName || '--' }}</p>
              <p class="fz13 gray">{{ scope.row.storeName || '--' }}</p>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="140" header-align="left" align="left" prop="memberId" label="会员信息">
        <template slot-scope="scope">
          <a class="ellipsis-100" :href="`${window.location.origin}/member/#/wechatmemberDetail?memberId=${scope.row.memberId}`" target="_blank">
            <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.thirdImgUrl)" width="60" height="60" />
            <div class="inline-block vertical-middle">
              <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
              <p class="fz13 gray">{{ scope.row.cardNum || '--' }}</p>
            </div>
          </a>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="false" min-width="120" align="left" prop="fwtd" label="服务/专业/门店">
        <template slot-scope="scope">
          {{ scope.row.fwtd + '/' + scope.row.zycd + '/' + scope.row.mdhj }}
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="false" width="80" align="center" prop="content" label="评语">
        <template slot-scope="scope">
          <el-popover class="item" trigger="hover" v-if="scope.row.content" :content="scope.row.content" placement="top-start">
            <i slot="reference" class="el-icon-message fz20 blue"></i>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="false" width="80" align="center" prop="replyStatus" label="回复">
        <template slot-scope="scope">
          <el-button v-if="scope.row.replyStatus !== 1 && scope.row.content" type="text" @click="replyData(scope.row)">立即回复</el-button>
          <el-popover v-if="scope.row.replyStatus === 1" class="item" trigger="hover" :content="scope.row.replyContent" placement="top-start">
            <i slot="reference" class="el-icon-message fz20 danger-color cursor"></i>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="left" width="140px" fixed="right">
        <template slot-scope="scope">
          <span class="fz13" v-if="scope.row.isBad === 0">好评</span>
          <span class="fz13" v-if="scope.row.visiteStatus === 0 && scope.row.isBad === 1">
            <el-button type="text" @click="allocateData(scope.row)">分配</el-button>
            <el-button type="text" @click="disAllocateData(scope.row)">不分配</el-button>
          </span>
          <span class="fz13" v-if="scope.row.visiteStatus === 1">已分配</span>
          <span class="fz13" v-if="scope.row.visiteStatus === 2">回访结束 <el-button type="text" @click="teleData(scope.row)">查看话务分配</el-button></span>
          <span class="fz13" v-if="scope.row.visiteStatus === 3">回访逾期</span>
          <span class="fz13" v-if="scope.row.visiteStatus === 4">不分配</span>
          <span class="fz13" v-if="scope.row.visiteStatus === 5">无需回访</span>
          <el-popover v-if="scope.row.visiteStatus === 6" placement="left" width="300" trigger="click">
            <div>{{ scope.row.delTaskReason || '暂无记录' }}</div>
            <el-button type="text" slot="reference">回访取消</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <reply :show.sync="replyShow" :id="replyId" @refresh="getTableList"></reply>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="tableList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { latestEvaluationList, evaluateBad, evaluationStoreExists, allocateEvaluation, changeShowStatus, exportLatestEvaluate } from '@/service/api/evaluationApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import reply from './reply';
import storeGroup from '@/components/storeGroup';
import tableMethods from '@/mixins/tableMethods.js';
import filterAvater from '@/mixins/filterAvater.js';
export default {
  name: 'newest',
  mixins: [tableMethods, filterAvater],
  data() {
    return {
      window: window,
      storeGroupData: {},
      formatDateTimeByType,
      loading: false,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      tableList: [],
      listParams: { searchName: '', currentPage: 1, pageSize: 20, isBad: 0, isContent: 0, currentStoreGroupId: '', visiteStatus: -1, beginTime: '', endTime: '' },
      visiteStatusOptions: [{ value: -1, label: '所有' }, { value: 0, label: '待分配' }, { value: 1, label: '已分配' }, { value: 2, label: '回访结束' }, { value: 3, label: '回访逾期' }, { value: 5, label: '无需回访' }, { value: 6, label: '回访取消' }],
      total: 0,
      replyShow: false,
      replyId: '',
      badStatus: this.$route.params.type,
      badOptions: [],
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.getTableList();
    if (this.$route.params.type) {
      this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '服务监督', path: '/evaluation' }, { name: '评价概览', path: '/evaluation/index/charts' }, { name: '差评详情', path: '' }]);
    } else {
      this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '服务监督', path: '/evaluation' }, { name: '最新评价', path: '' }]);
    }
  },
  watch: {
    $route(val) {
      this.getTableList();
    }
  },
  components: {
    reply,
    storeGroup
  },
  methods: {
    getStoreGroup(val) {
      this.listParams.currentStoreGroupId = val.storeGroupId || '';
      this.getTableList();
    },
    //回复
    replyData(row) {
      this.replyShow = true;
      this.replyId = row.evaluateId;
    },
    //分配 提示
    allocateData(row) {
      this.$confirm('确定将该评价回访任务分配给会员消费所在的门店店长？', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.allocateStore(row);
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消操作' });
        });
    },
    //分配 请求
    async allocateStore(row) {
      let resStore = await evaluationStoreExists({ storeId: row.storeId });
      if (resStore.errorCode === 0 && resStore.result) {
        let res = await allocateEvaluation({
          evaluateId: row.evaluateId,
          visiteStatus: 1,
          memberId: row.memberId,
          storeId: row.storeId,
          createTime: formatDateTimeByType(row.createTime, 'yyyy-MM-dd-HH-mm-ss'),
          evaluatedId: row.evaluatedId
        });
        if (res.errorCode === 0) {
          this.$tips({ type: 'warning', message: '分配成功' });
          this.getTableList();
        }
      } else {
        this.$tips({ type: 'warning', message: '门店不存在，不能执行分配操作' });
      }
    },
    //不分配 提示 请求
    disAllocateData(row) {
      this.$confirm('确定不分配该话务任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          allocateEvaluation({
            evaluateId: row.evaluateId,
            visiteStatus: 4
          }).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'warning', message: '操作成功' });
              this.getTableList();
            }
          });
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消操作' });
        });
    },
    //服务号显示隐藏
    async changeShow(row) {
      await changeShowStatus({ evaluateId: row.evaluateId, showStatus: row.showStatus });
      this.getTableList();
    },
    async getTableList(val) {
      if (this.$route.meta.type === 'bad') {
        try {
          this.loading = true;
          this.listParams.beginTime = this.listParams.senendTimedEndTime = '';
          console.log(this.badStatus, this.$route.params.type);
          let res = await evaluateBad(Object.assign({ badStatus: this.$route.params.type }, this.listParams));
          if (res.errorCode === 0 && res.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
            this.badOptions = res.result.badList;
          } else {
            this.tableList = [];
            this.total = 0;
          }
          this.loading = false;
        } catch (err) {
          this.loading = false;
        }
      } else {
        try {
          this.loading = true;
          this.formatterTimeFunc();
          let res = await latestEvaluationList(this.listParams);
          if (res.errorCode === 0 && res.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
          } else {
            this.tableList = [];
            this.total = 0;
          }
          this.loading = false;
        } catch (err) {
          this.loading = false;
        }
      }
    },
    teleData(row) {
      this.$router.push('/calllog');
    },
    exportLatestEvaluate() {
      this.formatterTimeFunc();
      if (!this.listParams.beginTime || !this.listParams.endTime) {
        this.$tips({ type: 'warning', message: '时间不能为空' });
        return;
      }
      this.dialogVisible = true;
      this.excelUrl = exportLatestEvaluate;
      this.params = {
        searchName: this.listParams.searchName,
        visiteStatus: this.listParams.visiteStatus,
        isContent: this.listParams.isContent,
        isBad: this.listParams.isBad,
        currentStoreGroupId: this.listParams.currentStoreGroupId,
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
