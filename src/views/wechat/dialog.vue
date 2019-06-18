<template>
  <el-dialog title="查看数据" :visible.sync="show" width="60%" :before-close="close" v-loading="loading">
    <el-table tooltipEffect="light" :data="dialogList" style="width: 100%">
      <el-table-column v-for="(v, i) in dialogHeader" :align="v.align" :key="i" :prop="v.prop" :label="v.label"></el-table-column>
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="close">确 定</el-button>
      <el-button @click="close">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getWechatCardData } from '@/service/api/wechatApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    dataId: {
      type: String,
      default: ''
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.getWechatCardData(this.dataId);
      }
    }
  },
  data() {
    return {
      loading: false,
      dialogHeader: [
        { label: '卡券', prop: 'cardName', width: '100', align: 'left' },
        { label: '备注名', prop: 'subName', width: '100', align: 'left' },
        { label: '发放量', prop: 'issuingQuantity', width: '100', align: 'left' },
        { label: '领取量', prop: 'getedQuantity', width: '100', align: 'left' },
        // {label:'领取率',prop:'sceneSettingName',width:'100',align:'left'},
        { label: '使用量', prop: 'usageQuantity', width: '100', align: 'left' },
        // {label:'核销量',prop:'sendCount',width:'100',align:'left'},
        { label: '销售额', prop: 'saleAmount', width: '100', align: 'left' }
      ],
      dialogList: []
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    async getWechatCardData(id) {
      let params = { wechatTeletextId: id };
      let res = await getWechatCardData(params);
      console.log(res);
      this.dialogList = res.result || [];
    }
  }
};
</script>
