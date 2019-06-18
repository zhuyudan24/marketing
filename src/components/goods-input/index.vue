<template>
  <div class="stock-input">
    <dm-select ref="bd-select" v-model="selectConf.value" :disabled="disabled" size="small" multiple :loading="selectConf.loading" filterable remote :remote-method="remoteMethod" :placeholder="placeholder" @change="selectChange">
      <el-option v-for="option in selectConf.options" :key="option.value" :value="option.value" :label="option.label">
        <div class="suggest-item">
          <!-- <span class="suggest-item__rt">{{option.value}}</span> -->
          <span class="suggest-item__lt">{{ option.label }} </span>
        </div>
      </el-option>
    </dm-select>
  </div>
</template>

<script>
import emitter from 'element-ui/lib/mixins/emitter';
import dmSelect from '../dm-select';
import { loadGoodsData } from '../../service/api/cardApi.js';
export default {
  props: {
    value: Array,
    disabled: Boolean,
    userId: String,
    multiple: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '输入货号或商品名称'
    },
    withparent: {
      type: Boolean,
      default: true
    },
    beforeSelect: Function
  },
  data() {
    return {
      selectConf: {
        value: !!this.value.find(p => !!p.id) ? this.value.map(item => item.id) : [],
        options: this.value.map(item => {
          return { value: item.id, label: item.name };
        }),
        loading: false
      },
      timer: null,
      cacheIndus: this.value.map(item => item)
    };
  },
  mixins: [emitter],
  watch: {
    value: {
      handler: function(val) {
        this.cacheIndus = val.map(item => item);
        this.selectConf.value = val.map(item => item.id);
        this.selectConf.options = val.map(item => {
          return { value: item.id, label: item.name };
        });
      },
      deep: true
    }
  },
  components: {
    'dm-select': dmSelect
  },
  methods: {
    remoteMethod(val) {
      // if (!val) {
      //   this.$tips({type:'warning',message:'搜索字段不能为空'});
      //   return;
      // }
      if (!val && this.selectConf.options.length > 0) return;
      this.selectConf.loading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        loadGoodsData({ currentPage: 1, pageSize: 20, searchParam: val }).then(res => {
          this.selectConf.options = [];
          res = res.result.result || [];
          this.$nextTick(() => {
            if (!!res && res instanceof Array) {
              res.forEach(item => {
                this.selectConf.options.push({
                  label: item.proName,
                  value: item.proNo
                });
                if (this.cacheIndus.findIndex(stk => stk.id === item.label) === -1) {
                  this.cacheIndus.push({
                    id: item.proNo,
                    name: item.proName
                  });
                }
              });
            }
            this.selectConf.loading = false;
          });
        });
      }, 300);
    },

    selectChange(val) {
      if (!this.multiple && val.length > 0) {
        this.selectConf.value.splice(0, this.selectConf.value.length - 1);
        val.splice(0, val.length - 1);
        this.$nextTick(_ => {
          this.$refs['bd-select'].$refs.select.visible = false;
        });
      }
      let arr = this.cacheIndus.filter(item => val.findIndex(v => v === item.id) !== -1);
      let arrCopy = JSON.parse(JSON.stringify(arr));
      if (!!this.beforeSelect && this.beforeSelect instanceof Function && !this.beforeSelect(arrCopy)) return;
      this.$emit('input', arr);
      this.$emit('change', arr);
    },

    iconClick() {
      this.remoteMethod();
    },

    induSelected(items) {
      this.selectConf.value = [];
      if (items.length === 0) return;
      items.forEach(item => {
        if (this.selectConf.value.findIndex(v => v === item.id) === -1) {
          this.selectConf.value.push(item.id);
        }
        if (this.selectConf.options.findIndex(option => option.value === item.id) === -1) {
          this.selectConf.options.push({
            label: item.label,
            value: item.id,
            code: item.code
          });
        }
        if (this.cacheIndus.findIndex(cache => cache.id === item.id) === -1) {
          this.cacheIndus.push({
            id: item.id,
            name: item.label,
            code: item.code
          });
        }
      });
      this.selectChange(this.selectConf.value);
      this.dispatch('ElFormItem', 'el.form.change', this.selectConf.value);
    }
  }
};
</script>

<style lang="scss" scoped>
.suggest-item {
  font-size: 12px;
  height: 24px;
  line-height: 24px;
  &__lt {
    float: left;
    width: calc(100% - 34px);

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__rt {
    float: right;
    color: #bbb;
    width: 30px;
    // padding-right: 10px;
    text-align: right;
  }
}
</style>
