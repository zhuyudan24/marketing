<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-select class="dm-select" v-model="listParams.gameStatus" placeholder="选择游戏状态" @change="refresh">
        <el-option v-for="(v, i) in gameStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-input v-model="listParams.searchParam" class="w200" placeholder="输入游戏名称" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="$router.push('/game/znm/add')">新建游戏</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading">
      <el-table-column v-for="(v, i) in tableHeader" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
        <template slot-scope="scope">
          <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
          <span v-else>{{ scope.row[v.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="220px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="setLinks(scope.row, 4)">链接</el-button>
          <el-button type="text" v-if="scope.row.activityStatus !== 0" @click="$router.push('/game/znm/record/' + scope.row.gameActivityId)">记录</el-button>
          <el-button type="text" v-if="scope.row.activityStatus === 0 || scope.row.activityStatus === 1" @click="$router.push('/game/znm/edit/' + scope.row.gameActivityId)">编辑</el-button>
          <el-button type="text" v-else @click="$router.push('/game/znm/info/' + scope.row.gameActivityId)">详情</el-button>
          <dm-delete @confirm="delData(scope.row)" tips="是否删除该游戏?">
            <el-button type="text">删除</el-button>
          </dm-delete>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <links :show.sync="linkShow" :obj="linksObj" :gameTypeName="gameTypeName"></links>
  </section>
</template>
<script>
import { formatDateTimeByType } from '@/utils/index.js';
import { LoadZnmList, deleteGame } from '@/service/api/gameApi.js';
import linksMixin from '../common/linksMixin.js';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'game-znm',
  mixins: [linksMixin, tableMethods],
  data() {
    return {
      loading: false,
      gameStatusOptions: [{ value: -1, label: '所有状态' }, { value: 1, label: '待开始' }, { value: 2, label: '进行中' }, { value: 3, label: '已结束' }],
      listParams: { gameStatus: -1, searchParam: '', currentPage: 1, pageSize: 20 },
      total: 0,
      tableHeader: [
        { label: '游戏名称', prop: 'gameName', minWidth: '150', align: 'left', fixed: 'left', tooltip: true },
        {
          label: '游戏状态',
          prop: 'activityStatus',
          minWidth: '100',
          align: 'left',
          formatter: function(row) {
            if (row.activityStatus === 1) {
              return `<div><span class="dm-status--primary--flash"></span>进行中</div>`;
            } else {
              return `<div class="${row.activityStatus === 0 ? 'dm-status--warning' : 'dm-status--info'}">
              ${row.activityStatus === 0 ? '待开始' : '已结束'}
              </div>`;
            }
          }
        },
        {
          label: '开始时间',
          prop: 'gameStartTime',
          minWidth: '100',
          tooltip: true,
          align: 'left',
          formatter: function(row) {
            return `<p class="cell-time">
                      ${formatDateTimeByType(row.gameStartTime, 'yyyy-MM-dd-HH-mm-ss', true).y}<br />
                      <span>${formatDateTimeByType(row.gameStartTime, 'yyyy-MM-dd-HH-mm-ss', true).h}</span>
                    </p>`;
          }
        },
        {
          label: '结束时间',
          prop: 'gameEndTime',
          minWidth: '100',
          tooltip: true,
          align: 'left',
          formatter: function(row) {
            return `<p class="cell-time">
                      ${formatDateTimeByType(row.gameEndTime, 'yyyy-MM-dd-HH-mm-ss', true).y}<br />
                      <span>${formatDateTimeByType(row.gameEndTime, 'yyyy-MM-dd-HH-mm-ss', true).h}</span>
                    </p>`;
          }
        },
        { label: '参与人数', prop: 'cyrs', width: '100', align: 'left' },
        { label: '参与次数', prop: 'cyrc', width: '100', align: 'left' }
      ],
      tableList: []
    };
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '' }, { name: '找你马', path: '/game/znm' }]);
  },
  methods: {
    async getTableList() {
      this.loading = true;
      try {
        let res = await LoadZnmList(this.listParams);
        this.tableList = res.result.result || [];
        this.total = res.result.totalCount;
      } catch (err) {
        this.$tips({ type: 'warning', message: '获取列表出错!' });
      }
      this.loading = false;
    },
    async delData(row) {
      try {
        let res = await deleteGame({ gameActivityId: row.gameActivityId });
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '删除成功!' });
          if (this.tableList.length === 1 && this.listParams.currentPage !== 1) {
            this.listParams.currentPage--;
          }
          this.getTableList();
        } else {
          this.$tips({ type: 'error', message: res.message || '删除失败!' });
        }
      } catch (err) {
        this.$tips({ type: 'error', message: '删除出错' });
      }
    }
  }
};
</script>
