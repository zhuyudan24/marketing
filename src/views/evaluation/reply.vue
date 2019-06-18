<template>
  <el-dialog title="回复" :visible.sync="show" width="30%" :before-close="close">
    <el-form :model="form" :rules="rules" ref="form" label-width="0" class="demo-ruleForm">
      <el-form-item prop="content">
        <dm-input type="textarea" v-model="form.content" :rows="4" placeholder="请输入回复内容" :maxlength="200"></dm-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
      <el-button type="primary" @click="submit('form')">提 交</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { evaluationReply } from '@/service/api/evaluationApi.js';
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
  data() {
    return {
      form: {
        content: ''
      },
      rules: {
        content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }, { max: 200, message: '字数不能大于200', trigger: 'blur' }]
      }
    };
  },
  methods: {
    close() {
      this.$refs.form.resetFields();
      this.$emit('update:show', false);
    },
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          evaluationReply({ evaluateId: this.id, replyContent: this.form.content }).then(res => {
            if (res.errorCode === 0) {
              this.close();
              this.$emit('refresh');
              this.$tips({ type: 'success', message: '回复成功' });
            } else {
              this.$tips({ type: 'warning', message: res.message || '回复失败' });
            }
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>
