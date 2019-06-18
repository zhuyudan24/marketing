export default {
  methods: {
    //编辑的时候提交
    editAlert() {
      return new Promise((resolve, reject) => {
        if (this.isEdit) {
          this.$confirm('游戏设置的修改保存后生效，历史数据不受影响', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(res => {
              console.log(res);
              resolve(res === 'cancel');
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          resolve(false);
        }
      });
    }
  }
};
