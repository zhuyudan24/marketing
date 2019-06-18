<template>
  <!-- :before-close="close('form')" -->
  <el-dialog title="礼品设置" :visible.sync="show" :append-to-body="true" width="30%" :before-close="handleCancel">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="礼品名称" prop="proGiftName">
        <el-input v-model="form.proGiftName" placeholder="请输入礼品名"></el-input>
      </el-form-item>
      <!-- <el-form-item label="礼品数量">
      <el-input v-model="form.prizeStock" placeholder="请输入礼品数量"></el-input>
    </el-form-item> -->
      <el-form-item label="礼品图片">
        <dm-upload-avatar class="inline-block" :model.sync="form.prizeImage" width="85" height="85" label="礼品图片" tips=""></dm-upload-avatar>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close('form')">取 消</el-button>
      <el-button type="primary" @click="saveGift('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import dmUploadAvatar from '@/components/upload/avatar';
import { saveGift } from '@/service/api/gameApi.js';

export default {
  props: {
    info: {
      type: Object,
      default() {
        return {};
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    show(val) {
      if (val) {
        // console.log(this.info,this.form)
        this.form = JSON.parse(JSON.stringify(this.info));
        // console.log(this.info,this.form)
      }
    }
  },
  data() {
    return {
      form: {
        prizeImage: { imgUrl: '', code: '' },
        proGiftId: '',
        giftStock: '',
        proGiftName: ''
      },
      rules: {
        proGiftName: { required: true, message: '请输入礼品名', trigger: 'blur' }
      }
    };
  },
  components: {
    dmUploadAvatar
  },
  methods: {
    handleCancel() {
      this.clear();
      this.close();
    },
    clear() {
      this.form.prizeImage = { imgUrl: '', code: '' };
      this.form.proGiftId = '';
      this.form.giftStock = '';
      this.form.proGiftName = '';
    },
    close(formName) {
      this.$emit('update:show', false);
      // this.$nextTick(_ => {
      //   this.$refs[formName].resetFields();
      // })
    },
    //保存奖品
    saveGift(formName) {
      if (!this.form.prizeImage.code) {
        this.$tips({ type: 'warning', message: '礼品图片未上传' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            giftName: this.form.proGiftName,
            giftStock: this.form.giftStock || 0,
            mainPicUrl: this.form.prizeImage.imgUrl || '',
            mainPicFieldCode: this.form.prizeImage.code || '',
            proGiftId: this.form.proGiftId
          };
          saveGift(params).then(res => {
            // console.log(this.form);
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: '保存成功' });
              this.form.proGiftId = res.result.proGiftId;
              this.$emit('update:info', this.form);
              this.close('form');
            } else {
              this.$tips({ type: 'success', message: res.message || '保存成功' });
            }
          });
        } else {
          this.$tips({ type: 'warning', message: '表单填写不完整' });
          return false;
        }
      });
    }
  }
};
</script>
