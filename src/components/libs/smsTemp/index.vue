<template>
  <section class="sms-lib">
    <div :class="pbSize">
      <span class="pr10">选择短信模板(共{{ total }}条)</span><el-input clearable v-model="listParams.search" class="w200" placeholder="请输入标题/作者" @change="LoadTempList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
    </div>
    <el-table tooltipEffect="light" :data="smsTempList" style="width: 100%" v-loading="loading" @row-click="rowClick">
      <el-table-column :show-overflow-tooltip="false" :width="60" align="center" prop="smsTemplateId">
        <template slot-scope="scope">
          <div class="sms-record_left label-hidden">
            <el-radio v-model="activeSmsId" :label="scope.row.smsTemplateId" class="pr10"></el-radio>
          </div>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" :width="200" :min-width="200" align="left" prop="title" label="模板名称"></el-table-column>
      <el-table-column :show-overflow-tooltip="false" :width="200" :min-width="200" align="left" prop="content" label="模板类型">
        <template slot-scope="scope">
          <p class="gray">{{ scope.row.type === 0 ? '普通短信' : scope.row.type === 1 ? '营销短信' : '验证码' }}</p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" :min-width="200" align="left" prop="content" label="模板内容">
        <template slot-scope="scope">
          <div>{{ scope.row.content }}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="smsTempList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>

<script>
import { LoadTempList } from '@/service/api/messageApi.js';
export default {
  props: {
    pbSize: {
      type: String,
      default: 'pb22'
    },
    activeId: String
  },
  data() {
    return {
      listParams: {
        search: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      smsTempList: [],
      activeSmsId: ''
    };
  },
  watch: {
    activeId(val) {
      this.activeSmsId = val;
    }
  },
  created() {
    this.LoadTempList();
  },
  methods: {
    rowClick(row) {
      this.activeSmsId = row.smsTemplateId;
      this.$emit('update:activeId', row.smsTemplateId);
      this.$emit('emitSmsItemInfo', row);
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.LoadTempList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.LoadTempList();
    },
    async LoadTempList() {
      this.loading = true;
      let res = await LoadTempList(this.listParams);
      this.smsTempList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    reset() {
      this.listParams.search = '';
      this.LoadTempList();
    }
  }
};
</script>
