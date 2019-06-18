<template>
  <section class="dm-wrap">
    <div class="msg-tips clearfix mb20">
      <div class="msg-tips__left fl">
        <i class="el-icon-info"></i>
      </div>
      <div class="msg-tips__center fl">
        <h4>获取品牌公众号模板消息</h4>
        <p>GIC将同步您微信公众号的所有模板消息</p>
      </div>
      <div class="msg-tips__right fr">
        <span class="fz13 gray pr10" v-if="getTemflag && dateStr">最近一次获取时间：{{ dateStr }}</span>
        <el-button type="primary" v-if="getTemflag" @click="syncWechatMessageTemplate">立即获取</el-button>
        <span class="msg-tips__right--load" v-if="!getTemflag"><i class="el-icon-loading"></i>正在获取...</span>
      </div>
    </div>
    <div class="clearfix pb22">
      <el-input v-model="listParams.searchParam" class="w300" placeholder="输入模板名称/ID/内容" clearable @change="pageTemplateMessage"><i slot="prefix" class="el-input__icon el-icon-searchParam"></i></el-input>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" @sort-change="sortList">
      <el-table-column v-for="(v, i) in tableHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter" :sortable="v.sortable">
        <template slot-scope="scope">
          <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
          <span v-else>{{ scope.row[v.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="140px" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="scope.row.bindStatusDesc !== '未绑定'" type="text" @click="$router.push('/msg/edit/' + scope.row.templateId)">编辑</el-button>
          <dm-delete v-if="scope.row.bindStatusDesc !== '未绑定'" @confirm="delData(scope.row)" tips="将同步删除公众号后台对应模板，一旦删除无法恢复。您确认吗?">
            <el-button type="text">删除</el-button>
          </dm-delete>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { pageTemplateMessage, syncWechatMessageTemplate, getLatestSyncTime, deleteTemplateAdvice } from '@/service/api/msgApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
export default {
  name: 'sms-record',
  data() {
    return {
      getTemflag: true,
      dateStr: '',
      loading: false,
      tableList: [],
      tableHeader: [
        { label: '标题', prop: 'templateName', minWidth: '150', tooltip: true, align: 'left' },
        {
          label: '绑定状态',
          prop: 'bindStatusDesc',
          minWidth: '120',
          align: 'left',
          formatter: function(row) {
            return `<span class="${row.bindStatusDesc === '已绑定' ? 'dm-status--primary' : 'dm-status--error'}">${row.bindStatusDesc || '--'}</span>`;
          }
        },
        {
          label: '类型',
          prop: 'typeName',
          minWidth: '100',
          tooltip: true,
          align: 'left',
          formatter: function(row) {
            return row.typeName || '--';
          }
        },
        {
          label: '最近更新时间',
          prop: 'col3',
          minWidth: '100',
          align: 'left',
          sortable: 'custom',
          formatter: function(row) {
            return `<p class="cell-time">
                      ${formatDateTimeByType(row.updateTime, 'yyyy-MM-dd-HH-mm-ss', true).y}<br />
                      <span>${formatDateTimeByType(row.updateTime, 'yyyy-MM-dd-HH-mm-ss', true).h}</span>
                    </p>`;
          }
        }
      ],
      listParams: {
        sortBy: '',
        searchParam: '', //否	String	输入发送人搜索
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total: 0
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '模板消息', path: '' }]);
    this.pageTemplateMessage();
    this.getLatestSyncTime();
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.pageTemplateMessage();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.pageTemplateMessage();
    },
    async getLatestSyncTime() {
      let res = await getLatestSyncTime();
      if (res.errorCode === 0) {
        this.dateStr = res.result;
      }
    },
    async syncWechatMessageTemplate() {
      this.getTemflag = false;
      let res = await syncWechatMessageTemplate();
      if (res.errorCode === 0) {
        this.$tips({ type: 'success', message: '获取成功!' });
        this.getLatestSyncTime();
        this.pageTemplateMessage();
      } else {
        this.$tips({ type: 'warning', message: '获取失败!' });
      }
      this.getTemflag = true;
    },
    async pageTemplateMessage() {
      try {
        this.loading = true;
        let res = await pageTemplateMessage(this.listParams);
        if (res.errorCode === 0 && res.result) {
          this.tableList = res.result.result || [];
          this.total = res.result.totalCount;
        } else {
          this.tableList = [];
          this.total = 0;
        }
      } catch (err) {}
      this.loading = false;
    },
    //列表 排序
    sortList(obj) {
      this.listParams.sortBy = obj.order === 'descending' ? obj.prop + ' desc' : obj.prop;
      this.pageTemplateMessage();
    },
    delData(row) {
      deleteTemplateAdvice({ templateId: row.templateId, weixinTemplateId: row.weixinTemplateId })
        .then(res => {
          if (res.errorCode === 0) {
            this.$tips({ type: 'success', message: '删除成功!' });
            if (this.tableList.length === 1 && this.listParams.currentPage !== 1) {
              this.listParams.currentPage--;
            }
            this.pageTemplateMessage();
          } else {
            this.$tips({ type: 'error', message: res.message || '删除失败!' });
          }
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '删除失败!' });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.msg-tips {
  // height: 84px;
  border: 1px solid #91d5ff;
  padding: 8px 16px;
  background: #e6f7ff;
  border-radius: 4px;
  &__left {
    i {
      font-size: 14px;
      color: #1890ff;
      line-height: 20px;
    }
  }
  &__center {
    position: relative;
    left: 10px;
    line-height: 1.5;
    h4 {
      font-size: 14px;
      color: #1890ff;
    }
    p {
      color: #606266;
      font-size: 13px;
    }
  }
  &__right {
    text-align: right;
    p {
      line-height: 1.2;
    }
    button {
      margin-top: 4px;
    }
    &--load {
      line-height: 40px;
    }
  }
}
</style>
