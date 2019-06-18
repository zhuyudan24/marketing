<template>
  <el-dialog title="短信错误码查询" :visible.sync="show" width="80%" :before-close="close">
    <div class="pb22">
      <el-input v-model="keyWord" class="w300" placeholder="请输入错误码" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
    </div>
    <el-table :data="errorCodeList" height="400" style="width: 100%">
      <el-table-column prop="code" label="错误码" width="80"></el-table-column>
      <el-table-column prop="pass" label="通道" width="80"></el-table-column>
      <el-table-column prop="reason" min-width="200" label="原因"></el-table-column>
      <el-table-column prop="plan" min-width="200" label="解决方案"></el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import errorCodeList from './errorCodeList.js';
export default {
  name: 'message-code',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      errorCodeList,
      keyWord: ''
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    search() {
      if (this.keyWord) {
        this.errorCodeList = errorCodeList.filter(v => v.code.indexOf(this.keyWord) > -1);
      } else {
        this.errorCodeList = errorCodeList;
      }
    }
  }
};
</script>
