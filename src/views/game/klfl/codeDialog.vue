<template>
  <el-dialog title="选择口令" :visible.sync="show" width="40%" :before-close="close">
    <el-input v-model="searchName" class="w200" placeholder="请输入口令" size="medium" clearable @change="klflCodeList"><i slot="prefix" class="el-input__icon el-icon-search" @click="klflCodeList"></i></el-input>
    <el-table tooltipEffect="light" :data="tableList" class="pt10" style="width:100%" height="300" v-loading="loading">
      <el-table-column align="left" label="口令名称">
        <template slot-scope="scope">
          <el-radio v-model="radio" :label="scope.row">{{ scope.row.gameCode }}</el-radio>
        </template>
      </el-table-column>
      <el-table-column align="left" label="口令个数" prop="codeStock"></el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
      <el-button type="primary" @click="submit">保 存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { klflCodeList } from '@/service/api/gameApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.klflCodeList();
      }
    }
  },
  data() {
    return {
      loading: false,
      searchName: '',
      tableList: [],
      radio: {}
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    async klflCodeList() {
      this.loading = true;
      let res = await klflCodeList({ gameActivityId: this.$route.params.id || this.id, minStock: '', searchName: this.searchName });
      this.tableList = res.result;
      this.loading = false;
    },
    submit() {
      this.$emit('selectedCode', this.radio);
      this.close();
      this.radio = {};
    }
  }
};
</script>
