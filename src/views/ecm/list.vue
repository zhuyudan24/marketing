<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-select class="dm-select" clearable="" v-model="listParams.effectType" placeholder="选择时效" @change="search">
        <el-option v-for="(v, i) in effectTypeOption" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-select class="dm-select" clearable v-model="listParams.marketingType" placeholder="选择营销方式" @change="search">
        <el-option v-for="(v, i) in marketingTypeOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-select class="dm-select" clearable v-model="listParams.sceneSettingId" placeholder="选择营销场景" @change="search">
        <el-option v-for="v in sceneSettingIdOptions" :key="v.sceneSettingId" :label="v.sceneName" :value="v.sceneSettingId"></el-option>
      </el-select>
      <el-select class="dm-select" clearable v-model="listParams.onlineStatus" placeholder="选择上线状态" @change="search">
        <el-option v-for="(v, i) in onlineOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>

      <el-input v-model="listParams.searchName" class="w200" placeholder="输入计划名称" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="$router.push('/ecm/add')">新建计划</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column v-for="(v, i) in tableHeader" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
        <template slot-scope="scope">
          <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
          <span v-else>{{ scope.row[v.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="220" fixed="right">
        <template slot-scope="scope">
          <dm-delete v-if="scope.row.onlineStatus === 1" @confirm="offlineEcmPlan(scope.row)" tips="是否下线该计划?">
            <el-button type="text">下线</el-button>
          </dm-delete>
          <el-button type="text" @click="editData(scope.row)">编辑</el-button>
          <dm-delete v-if="scope.row.putonStatus !== 2" @confirm="delData(scope.row)" tips="是否删除该计划?">
            <el-button type="text">删除</el-button>
          </dm-delete>
          <el-button type="text" @click="toRecord(scope.row)">记录</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { loadEcmList, deleteEcm, offlineEcmPlan } from '@/service/api/ecmApi.js';
import { sceneSettingList } from '@/service/api/commonApi.js';
const marketingTypeOptions = [{ value: '', label: '所有发送类型' }, { value: 'card', label: '卡券营销' }, { value: 'message', label: '短信营销' }, { value: 'teletext', label: '图文营销' }, { value: 'text', label: '文本营销' }, { value: 'teltask', label: '话务' }, { value: 'image', label: '微信图片' }];
export default {
  name: 'ecm',
  data() {
    return {
      effectTypeOption: [{ value: '', label: '所有时效' }, { value: 0, label: '实时' }, { value: 1, label: '定时' }],
      onlineOptions: [{ value: '', label: '所有上线状态' }, { value: 0, label: '待上线' }, { value: 1, label: '已上线' }, { value: 2, label: '已下线' }],
      sceneSettingIdOptions: [],
      marketingTypeOptions,
      listParams: {
        effectType: '', // 全部失效的默认值是-1,提交时判断''改为-1
        marketingType: '',
        sceneSettingId: '',
        onlineStatus: '',
        searchName: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      loading: false,
      tableHeader: [
        { label: '计划名称', prop: 'ecmPlanName', minWidth: '160', align: 'left', fixed: 'left' },
        {
          label: '时效',
          prop: 'effectType',
          width: '160',
          align: 'left',
          formatter(row) {
            return row.effectType ? `<span><i class="el-icon-time fz18 vertical-middle"></i><span class="vertical-middle"> 每天${row.effectTime}:00</span></span>` : '实时';
          }
        },
        { label: '营销方式', prop: 'marketingType', minWidth: '160', align: 'left' },
        { label: '营销场景', prop: 'sceneSettingName', width: '160', align: 'left' },
        { label: '营销人次', prop: 'timesForPeople', width: '160', align: 'left' },
        {
          label: '上线状态',
          prop: 'onlineStatus',
          width: '160',
          align: 'left',
          formatter(row) {
            let result = '--';
            switch (row.onlineStatus) {
              case 0:
                result = '<span class="dm-status--primary">待上线</span>';
                break;
              case 1:
                result = '<span class="dm-status--success">已上线</span>';
                break;
              case 2:
                result = '<span class="dm-status--info">已下线</span>';
                break;
            }
            return result;
          }
        }
      ],
      tableList: []
    };
  },
  created() {
    this.loadEcmList();
    this.sceneSettingList();
    this.$store.commit('aside_handler', false);
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '智能营销', path: '/ecm' }]);
  },
  methods: {
    search() {
      this.listParams.currentPage = 1;
      this.loadEcmList();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.loadEcmList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.loadEcmList();
    },
    async loadEcmList() {
      this.loading = true;
      const params = { ...this.listParams };
      if (params.effectType === '') {
        params.effectType = -1; // 全部时效的默认值是-1
      }
      let res = await loadEcmList(params);
      console.log(res);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    //编辑
    editData(row) {
      this.$router.push('/ecm/edit/' + row.ecmPlanId);
    },
    // 记录
    toRecord(row) {
      this.$router.push(`/ecm/${row.effectType ? 'batchlist' : 'currentlist'}/${row.ecmPlanId}/${row.ecmPlanName}`);
    },
    // 删除
    async delData(row) {
      try {
        let res = await deleteEcm({ ecmPlanId: row.ecmPlanId });
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '删除成功!' });
          if (this.tableList.length === 1 && this.listParams.currentPage !== 1) {
            this.listParams.currentPage--;
          }
          this.loadEcmList();
        } else {
          this.$tips({ type: 'error', message: res.message || '删除失败!' });
        }
      } catch (err) {
        this.$tips({ type: 'error', message: '删除失败!' });
      }
    },
    // 下线
    async offlineEcmPlan(row) {
      try {
        let res = await offlineEcmPlan({ ecmPlanId: row.ecmPlanId });
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '下线成功!' });
          this.loadEcmList();
        } else {
          this.$tips({ type: 'error', message: res.message || '下线失败!' });
        }
      } catch (err) {
        this.$tips({ type: 'error', message: '下线失败!' });
      }
    },
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = res.result || [];
      this.sceneSettingIdOptions.unshift({ sceneName: '所有营销场景', sceneSettingId: '' });
    }
  }
};
</script>
