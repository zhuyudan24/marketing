<template>
  <el-dialog title="拼图配置" :visible.sync="show" width="40%" :before-close="close" v-loading="loading">
    <h3 class="fz16 pb20">机制设置</h3>
    <h4 class="fz14 gray pb20">用户免费体力数</h4>
    <el-radio v-model="form.sysGiveValueType" :label="1">
      总共免费 <span v-if="form.sysGiveValueType === 1"><el-input-number controls-position="right" :min="0" class="w200" type="number" :disabled="form.sysGiveValueType !== 1" v-model="form.sysGiveValue"></el-input-number> 体力</span>
    </el-radio>
    <p class="pb20"></p>
    <el-radio v-model="form.sysGiveValueType" :label="2">
      每天免费 <span v-if="form.sysGiveValueType === 2"><el-input-number controls-position="right" :min="0" class="w200" type="number" :disabled="form.sysGiveValueType !== 2" v-model="form.sysGiveValue"></el-input-number> 体力</span>
    </el-radio>
    <h4 class="fz14 gray pb20 pt20">分享赠送体力</h4>
    <el-radio v-model="form.shareGiveValueType" :label="1">
      一次赠送 <span v-if="form.shareGiveValueType === 1"><el-input-number controls-position="right" :min="0" class="w200" type="number" :disabled="form.shareGiveValueType !== 1" v-model="form.shareGiveValue"></el-input-number> 体力给好友，仅能送一次</span>
    </el-radio>
    <p class="pb20"></p>
    <el-radio v-model="form.shareGiveValueType" :label="2">
      每天赠送 <span v-if="form.shareGiveValueType === 2"><el-input-number controls-position="right" :min="0" class="w200" type="number" :disabled="form.shareGiveValueType !== 2" v-model="form.shareGiveValue"></el-input-number> 体力给好友，仅能送一次</span>
    </el-radio>
    <span slot="footer" class="dialog-footer">
      <el-button @click="submit" type="primary">保 存</el-button>
      <el-button @click="close">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { ptyxConfigDetail, ptyxConfigSave } from '@/service/api/gameApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      form: {
        sysGiveValueType: 1,
        sysGiveValue: '',
        shareGiveValueType: 1,
        shareGiveValue: '',
        accountValueSettingId: '',
        enterpriseId: ''
      }
    };
  },
  watch: {
    show(val) {
      if (val) {
        this.ptyxConfigDetail();
      }
    }
  },
  methods: {
    async ptyxConfigDetail() {
      this.loading = true;
      let res = await ptyxConfigDetail();
      if (res.errorCode === 0 && res.result) {
        this.form = res.result;
      }
      this.loading = false;
    },
    close() {
      this.$emit('update:show', false);
    },
    submit() {
      this.$confirm('是否保存配置?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true;
          ptyxConfigSave(this.form).then(res => {
            this.loading = false;
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: '保存成功' });
              this.close();
            } else {
              this.$tips({ type: 'error', message: res.message || '保存失败' });
            }
          });
        })
        .catch(err => {
          this.$tips({ type: 'info', message: '取消保存' });
        });
    }
  }
};
</script>
<style lang="scss" scoped></style>
