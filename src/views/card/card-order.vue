<template>
  <el-dialog title="选择订单" :visible.sync="show" width="60%" :before-close="close">
    <div class="pb10">
      <el-input v-model="listParams.searchParam" class="w300" placeholder="请输入订单信息" @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <span class="fz12 gray pl20">*仅显示满足核销条件的订单 </span>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" @row-click="rowClick">
      <el-table-column :show-overflow-tooltip="false" :width="60" align="left" prop="orderId" label="选择">
        <template slot-scope="scope">
          <div class="sms-record_left label-hidden">
            <el-radio v-model="selectedId" :label="scope.row.orderId" class="pr10"></el-radio>
          </div>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" align="left" prop="storeCode" label="消费门店"></el-table-column>
      <el-table-column :show-overflow-tooltip="false" align="left" prop="orderNumber" label="订单流水号"></el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { listCoupcardOrder, writeOffCard } from '@/service/api/cardApi.js';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'card-order',
  mixins: [tableMethods],
  props: {
    obj: {
      type: Object,
      default() {
        return {
          memberId: '',
          coupCardId: '',
          orderNumber: ''
        };
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      listParams: {
        currentPage: 1,
        pageSize: 20,
        coupLogId: '',
        memberId: '',
        searchParam: ''
      },
      total: 0,
      tableList: [],
      selectedId: '',
      selectedObj: {}
    };
  },
  watch: {
    show(val) {
      this.listParams.coupLogId = this.obj.coupLogId;
      this.listParams.memberId = this.obj.memberId;
      if (val) this.getTableList();
    }
  },
  methods: {
    // 加载列表
    async getTableList() {
      this.loading = true;
      try {
        let res = await listCoupcardOrder(this.listParams);
        this.tableList = res.result.result || [];
        this.total = res.result.totalCount;
      } catch (err) {
        this.$tips({ type: 'error', message: '初始化失败' });
      }
      this.loading = false;
    },
    close() {
      this.$emit('update:show', false);
    },
    // 点击行选择卡券
    rowClick(row) {
      this.selectedId = row.orderId;
      this.selectedObj = row;
    },
    submit() {
      if (this.selectedId) {
        this.writeOffCard();
      } else {
        this.tips({ type: 'warning', message: '未选择订单' });
      }
    },
    // 核销订单
    async writeOffCard() {
      console.log(this.obj);
      try {
        let res = await writeOffCard({ coupLogId: this.obj.coupLogId, orderId: this.selectedId, memberId: this.obj.memberId, oorderNumber: this.selectedObj.orderNumber });
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '核销成功' });
          this.close();
          this.selectedId = '';
        } else {
          this.$tips({ type: 'error', message: '核销失败' });
        }
      } catch (err) {
        this.$tips({ type: 'error', message: '核销失败' });
      }
    }
  }
};
</script>
