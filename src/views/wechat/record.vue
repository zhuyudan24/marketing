/* * @Author: zhangmeng * @Date: 2018-08-14 15:45:36 * @Last Modified by: zhangmeng * @Last Modified time: 2019-01-08 14:22:58 */
<template>
  <section class="dm-wrap">
    <!-- <el-button type="danger" plain disabled>删除</el-button> -->
    <div class="pb22">
      <el-select class="vertical-middle w150" v-model="listParams.contentType" placeholder="选择群发类型" @change="search">
        <el-option v-for="item in contentTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select class="vertical-middle w150" v-model="listParams.sendStatus" placeholder="选择发送状态" @change="search">
        <el-option v-for="item in sendStatusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select class="vertical-middle w150" v-model="listParams.sceneSettingId" placeholder="选择营销场景" @change="search">
        <el-option v-for="item in sceneSettingIdOptions" :key="item.sceneSettingId" :label="item.sceneName" :value="item.sceneSettingId"></el-option>
      </el-select>
      <el-checkbox class="vertical-middle" v-model="listParams.hideInvalid" :true-label="1" :false-label="0" label="隐藏已失效" border @change="search"></el-checkbox>
      <el-input v-model="listParams.clerkName" clearable class="vertical-middle w200" placeholder="请输入发送人名称" @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="$router.push('/wechat/record/add')">新建群发</el-button>
    </div>
    <el-table tooltipEffect="light" :data="recordList" style="width: 100%" row-key="sendTime" v-loading="loading">
      <el-table-column :min-width="100" align="left" label="时间" prop="createTime">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br /><span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in recordHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter" :fixed="v.fixed" :render-header="v.renderHeader"></el-table-column>
      <el-table-column label="状态" align="left" prop="timesStatus" width="160px">
        <template slot-scope="scope">
          <span v-if="scope.row.sendStatus == 1" class="dm-status--success">已发送</span>
          <span v-if="scope.row.sendStatus == 2" class="dm-status--info">已失效</span>
          <div v-if="scope.row.sendStatus == 0">
            <span class="dm-status--primary">待发送</span>
            <time-counts class="primary-color fz12" :defaultVal="scope.row.sendTime" :autoStart="true"></time-counts>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="180px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.contentType === 0 && scope.row.sendStatus === 1 && scope.row.couponType === 1" @click="queryData(scope.row)">数据</el-button>
          <dm-delete @confirm="delData(scope.row)" tips="是否删除该发送记录?">
            <el-button type="text">删除</el-button>
          </dm-delete>
          <dm-delete @confirm="invalidData(scope.row)" v-if="scope.row.contentType === 0 && scope.row.sendType !== 2 && scope.row.sendStatus == 1" tips="是否禁用该发送记录?">
            <el-button type="text">禁用</el-button>
          </dm-delete>
          <el-button type="text" v-if="scope.row.sendStatus === 0" @click="$router.push('/wechat/record/edit/' + scope.row.wechatTeletextId)">编辑</el-button>
          <el-button type="text" v-if="scope.row.sendStatus !== 0" @click="$router.push('/wechat/record/info/' + scope.row.wechatTeletextId)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <dm-dialog :show.sync="dmDialogShow" :dataId="dmDialogId"></dm-dialog>
  </section>
</template>
<script>
import { sendRecordList, sceneSettingList, delWechatMarketingRecord, invalidWechatMarketingRecord } from '@/service/api/wechatApi.js';
import dmDialog from './dialog';
import { formatDateTimeByType } from '@/utils/index.js';
import timeCounts from '@/components/timeCount/index.vue';
export default {
  name: 'wechat-record',
  components: {
    dmDialog,
    'time-counts': timeCounts
  },
  data() {
    return {
      contentTypeOptions: [{ value: '', label: '所有类型' }, { value: 0, label: '图文消息' }, { value: 1, label: '文本消息' }, { value: 2, label: '图片' }],
      sendStatusOptions: [{ value: '', label: '所有状态' }, { value: 0, label: '待发送' }, { value: 1, label: '已发送' }, { value: 2, label: '已失效' }],
      sceneSettingIdOptions: [],
      loading: false,
      recordList: [],
      recordHeader: [
        // {
        //   label: '时间',
        //   prop: 'createTimeStr',
        //   align: 'left',
        //   fixed: 'left',
        //   className: 'newline',
        //   formatter: function(row) {
        //     const date = formatDateTimeByType(row.createTime, 'yyyy-MM-dd-HH-mm-ss', true);
        //     return date.y + '\n' + date.h;
        //   }
        // },
        { label: '用户名称', prop: 'clerkName', align: 'left', fixed: 'left', minWidth: '100' },
        {
          label: '标题',
          prop: 'content',
          tooltip: false,
          align: 'left',
          formatter: function(row, column, cellValue, index) {
            let temp = null;
            if (row.mediaUrl) {
              if (row.couponType === 1) {
                temp = (
                  <p>
                    <i class="iconfont icon-qiapian- blue" />
                    <a href={row.mediaUrl} target="_blank">
                      {' '}
                      {row.content}
                    </a>
                  </p>
                );
              } else {
                temp = (
                  <a href={row.mediaUrl} target="_blank">
                    {row.content}
                  </a>
                );
              }
            } else {
              temp = <span>{row.content}</span>;
            }
            if (row.content && row.content.length > 10) {
              return (
                <el-popover placement="top-start" width="200" trigger="hover">
                  <span class="word-break-all">{row.content}</span>
                  <div class="ellipsis" slot="reference">
                    {temp}
                  </div>
                </el-popover>
              );
            } else {
              return temp;
            }
          }
        },
        { label: '营销场景', prop: 'sceneSettingName', align: 'left' },
        { label: '发送人数', prop: 'sendMemberCount', width: '100', align: 'left' },
        { label: '送达人数', prop: 'sendCount', width: '100', align: 'left' },
        {
          label: '阅读人数',
          prop: 'readCount',
          width: '100',
          align: 'left',
          renderHeader: (h, { colunm, $index }) => {
            return this.renderHeader('阅读人数');
          }
        },
        {
          label: '分享人数',
          prop: 'redirectCount',
          width: '100',
          align: 'left',
          renderHeader: (h, { colunm, $index }) => {
            return this.renderHeader('分享人数');
          }
        },
        {
          label: '收藏人数',
          prop: 'collectCount',
          width: '100',
          align: 'left',
          renderHeader: (h, { colunm, $index }) => {
            return this.renderHeader('收藏人数');
          }
        }
      ],
      listParams: {
        contentType: '', //否	number	图文类型（0：图文消息，1：文本消息, 2: 图片）
        sendStatus: '', //否	number	发送状态（0：待发送，1：已发送，2：已失效）
        sceneSettingId: '', //否	String	营销场景ID (全部:null)
        hideInvalid: 0, //否	Number	隐藏失效: 1 (不隐藏: 0)
        clerkName: '', //否	String	输入发送人搜索
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total: 0,
      dmDialogShow: false,
      dmDialogId: ''
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理' }, { name: '微信营销', path: '' }, { name: '发送记录', path: '' }]);
    this.sendRecordList();
    this.sceneSettingList();
  },
  methods: {
    formatDateTimeByType,
    search() {
      this.listParams.currentPage = 1;
      this.sendRecordList();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.sendRecordList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.sendRecordList();
    },
    async sendRecordList() {
      this.loading = true;
      let res = await sendRecordList(this.listParams);
      this.recordList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = res.result || [];
      this.sceneSettingIdOptions.unshift({ sceneName: '所有营销场景', sceneSettingId: '' });
    },
    //发送记录操作--查看数据
    queryData(row) {
      this.dmDialogShow = true;
      this.dmDialogId = row.wechatTeletextId;
    },
    //发送记录操作: 删除
    delData(row) {
      delWechatMarketingRecord({ wechatTeletextId: row.wechatTeletextId })
        .then(res => {
          this.$tips({ type: 'success', message: '删除成功!' });
          if (this.recordList.length === 1 && this.listParams.currentPage !== 1) {
            this.listParams.currentPage--;
          }
          this.sendRecordList();
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '删除失败!' });
        });
    },
    //发送记录操作: 失效
    invalidData(row) {
      invalidWechatMarketingRecord({ wechatTeletextId: row.wechatTeletextId })
        .then(res => {
          this.$tips({ type: 'success', message: '禁用成功!' });
          this.sendRecordList();
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '禁用失败!' });
        });
    },
    renderHeader(label) {
      return <span class="fw500">{label}</span>;
      // return ( <el-tooltip class="item" effect="dark" content="只对发送图文7天内的数据进行统计" placement="top-start">
      //   <span class="fw500">{label} <i class="iconfont icon-xinxixianshi  fz14"></i></span>
      //   </el-tooltip>)
    }
  }
};
</script>
