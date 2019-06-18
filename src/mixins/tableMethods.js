/*------列表方法---------*/
// refresh
// getList
// 分页
//
export default {
  methods: {
    refresh() {
      this.listParams.currentPage = 1;
      this.getTableList();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.getTableList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.getTableList();
    }
  }
};
