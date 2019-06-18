<template>
  <section class="dm-wrap">
    <div class="clearfix pb22">
      <el-date-picker class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="refresh"></el-date-picker>
      <el-select class="dm-select" v-model="listParams.sendStatus" placeholder="选择发送状态" @change="refresh">
        <el-option v-for="item in sendStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select class="dm-select" v-model="listParams.sceneSettingId" placeholder="选择营销场景" @change="refresh">
        <el-option v-for="item in sceneSettingIdOptions" :key="item.sceneSettingId" :label="item.sceneName" :value="item.sceneSettingId"></el-option>
      </el-select>
      <el-input v-model="listParams.search" class="w200" placeholder="输入模板名称/ID/内容" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="$router.push('/message/record/add')">新建群发</el-button>
    </div>
    <el-table tooltipEffect="light" :data="messageList" style="width: 100%" row-key="sendTime" v-loading="recordLoading">
      <el-table-column :min-width="100" align="left" label="发送时间" prop="sendTime">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.sendTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br /><span>{{ formatDateTimeByType(scope.row.sendTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in recordHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter" :fixed="v.fixed"></el-table-column>
      <el-table-column label="状态" prop="sendStatus" align="left" width="140px">
        <template slot-scope="scope">
          <span v-if="scope.row.sendStatus === 5"><span class="dm-status--primary--flash"></span>执行中</span>
          <span v-else :class="'dm-status--' + filterStatus(scope.row.sendStatus).type">{{ filterStatus(scope.row.sendStatus).label }}</span>
          <time-counts v-if="scope.row.sendStatus == 0" class="primary-color fz12" :defaultVal="scope.row.sendTime" :autoStart="true"></time-counts>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="140px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="$router.push('/message/record/detail/' + scope.row.smsId)">详情</el-button>
          <dm-delete v-if="scope.row.sendStatus == 4 || scope.row.sendStatus == 0" @confirm="invalidData(scope.row)" tips="是否禁用该发送记录?">
            <el-button type="text">禁用</el-button>
          </dm-delete>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="messageList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { LoadMessageList, invalidsmsRecord } from '@/service/api/messageApi.js';
import { sceneSettingList } from '@/service/api/wechatApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import timeCounts from '@/components/timeCount/index.vue';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'sms-record',
  components: {
    timeCounts
  },
  mixins: [tableMethods],
  data() {
    return {
      sendStatusOptions: [{ value: '', label: '所有状态', type: '' }, { value: 0, label: '定时执行', type: 'warning' }, { value: 1, label: '执行完毕', type: 'success' }, { value: 2, label: '执行失败', type: 'danger' }, { value: 3, label: '无可用模板', type: 'danger' }, { value: 4, label: '定时执行', type: 'info' }, { value: 5, label: '执行中', type: 'primary--flash' }, { value: -1, label: '已失效', type: 'danger' }],
      sceneSettingIdOptions: [{ sceneSettingId: -1, sceneName: '所有营销场景' }],
      recordLoading: false,
      messageList: [],
      recordHeader: [
        // {
        //   label: '发送时间',
        //   prop: 'sendTime',
        //   minWidth: '160',
        //   align: 'left',
        //   fixed: 'left',
        //   formatter(row) {
        //     const date = formatDateTimeByType(row.sendTime, 'yyyy-MM-dd-HH-mm-ss', true);
        //     return date.y + '\n' + date.h;
        //   }
        // },
        {
          label: '模板名称',
          prop: 'templateName',
          minWidth: '140',
          align: 'left',
          fixed: 'left',
          formatter: row => {
            return (
              <div>
                <span>{row.templateName}</span>
                <p class="fz13 gray">(ID:{row.templateId})</p>
              </div>
            );
          }
        },
        { label: '发送人', prop: 'sendName', width: '100', tooltip: true, align: 'left' },
        {
          label: '模板内容',
          prop: 'templateContent',
          minWidth: '150',
          tooltip: false,
          align: 'left',
          formatter: (row, column, cellValue, index) => {
            if (row.templateContent && row.templateContent.length > 10) {
              return (
                <el-popover placement="top-start" width="200" trigger="hover" content={row.templateContent}>
                  <div class="ellipsis" slot="reference">
                    {row.templateContent}
                  </div>
                </el-popover>
              );
            } else {
              return <span>{row.templateContent}</span>;
            }
          }
        },
        { label: '计划人数', prop: 'sendCount', width: '100', align: 'left' },
        { label: '送达人数', prop: 'sendSuccess', width: '100', align: 'left' },
        { label: '计费条数', prop: 'countNum', width: '100', align: 'left' }
      ],
      listParams: {
        sendStatus: '',
        sceneSettingId: -1,
        sendBeginTime: '',
        sendEndTime: '',
        search: '',
        currentPage: 1,
        pageSize: 20
      },
      dateTime: ['', ''],
      total: 0
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '' }, { name: '短信群发', path: '' }]);
    this.getTableList();
    this.sceneSettingList();
  },
  methods: {
    formatDateTimeByType,
    async getTableList() {
      try {
        this.recordLoading = true;
        if (this.dateTime) {
          this.listParams.sendBeginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
          this.listParams.sendEndTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
        } else {
          this.listParams.sendBeginTime = this.listParams.sendEndTime = '';
        }
        let res = await LoadMessageList(this.listParams);
        if (res.errorCode === 0 && res.result) {
          this.messageList = res.result.result || [];
          this.total = res.result.totalCount;
        } else {
          this.messageList = [];
          this.total = 0;
        }
        this.recordLoading = false;
      } catch (err) {
        this.recordLoading = false;
      }
    },
    invalidData(row) {
      invalidsmsRecord({ smsId: row.smsId })
        .then(res => {
          this.$tips({ type: 'success', message: '禁用成功!' });
          this.getTableList();
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '禁用失败!' });
        });
    },
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = this.sceneSettingIdOptions.concat(res.result || []);
    },
    filterStatus(val) {
      let result = { label: '执行错误', type: 'warning' };
      this.sendStatusOptions.forEach(v => {
        if (val === v.value) result = v;
      });
      return result;
    }
  }
};
</script>
