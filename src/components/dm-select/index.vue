<template>
  <div class="bd-select">
    <el-popover :disabled="currentValue.length === 0" v-cloak ref="popover" placement="left" :width="popoverWidth" trigger="hover" content="" popper-class="bd-select__popover">
      <div class="bd-select__popover__title">
        <div class="bd-select__popover__title__lt">
          <span class="left">{{ popoverTitle }}</span>
          <span class="right">(共{{ this.currentValue.length }}项)</span>
        </div>
        <div class="bd-select__popover__title__rt" @click="clearAllTags" v-if="!disabled">
          <i class="el-icon-delete"></i>
        </div>
      </div>
      <el-tag v-for="tag in tags.length === 0 ? initTags : tags" :key="tag.value" type="primary" :closable="!disabled" @close="popoverTagRemove(tag)">
        {{ tag.label }}
      </el-tag>
    </el-popover>
    <el-select ref="select" v-model="currentValue" :reserve-keyword="reserveKeyword" :multiple="multiple" :disabled="disabled" :value-key="valueKey" :size="medium" :clearable="clearable" :multiple-limit="multipleLimit" :name="name" :placeholder="placeholder" :filterable="filterable" :allow-create="allowCreate" :filter-method="filterMethod" :remote="remote" :remote-method="remoteMethod" :loading="loading" :loading-text="loadingText" :no-match-text="noMatchText" :no-data-text="noDataText" :popper-class="popperClass" :default-first-option="defaultFirstOption" @change="change" @visible-change="visibleChange" @remove-tag="removeTag" @clear="clear" :class="{ single: single }">
      <slot></slot>
    </el-select>
    <div v-if="!!icon" class="bd-select__icon__wrap" @click="iconClick">
      <i class="bd-select__icon" :class="icon"></i>
    </div>

    <div v-popover:popover v-show="multiple && currentValue.length > 1" class="bd-select__total" @click="selectClick">{{ '共' + this.currentValue.length + '项' }}</div>
  </div>
</template>

<script>
import emitter from 'element-ui/lib/mixins/emitter';

export default {
  name: 'dm-select',
  componentName: 'dmSelect',
  props: {
    // 以下是自定义属性
    value: [Array, Number, String],
    popoverTitle: String,
    popoverWidth: {
      type: Number,
      default: 200
    },
    icon: String,
    forceWithOption: Boolean, //强制关联选项，当选项移除时，自动移除value
    // 以下是element ui select 原生属性
    name: String,
    id: String,
    size: String,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    popperClass: String,
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0
    },
    placeholder: String,
    defaultFirstOption: Boolean,
    reserveKeyword: Boolean,
    valueKey: {
      type: String,
      default: 'value'
    },
    collapseTags: Boolean
  },
  data() {
    return {
      currentValue: JSON.parse(JSON.stringify(this.value)),
      initTags: [],
      // options: [],
      visible: false,
      elSelect: null
    };
  },
  mixins: [emitter],
  computed: {
    options() {
      // const options = this.elSelect.options;
      // if (options.length > 0) {
      //     console.log(options[0]);
      // }
      return !!this.elSelect ? this.elSelect.options.map(item => ({ label: item.label, value: item.value })) : [];
    },
    tags() {
      let tags = [];
      if (this.currentValue instanceof Array && this.currentValue.length > 0) {
        this.currentValue.forEach(value => {
          let option = this.options.find(p => p.value === value);
          if (!!option) {
            tags.push(option);
          }
        });
      }
      if (tags.length > 0 && this.initTags.length > 0) {
        // eslint-disable-next-line
        this.initTags = [];
      }
      return tags;
    },
    single() {
      return !this.multiple;
    }
  },
  watch: {
    value: {
      handler: function(val) {
        let b = false;
        for (let i = 0; i < val.length; i++) {
          if (val[i] !== this.currentValue[i]) {
            b = true;
            break;
          }
        }

        for (let i = 0; i < this.currentValue.length; i++) {
          if (val[i] !== this.currentValue[i]) {
            b = true;
            break;
          }
        }

        if (b) {
          this.currentValue = JSON.parse(JSON.stringify(this.value));
        }
      },
      deep: true
    },

    options: {
      handler: function(_options, oldValue) {
        if (this.forceWithOption && (_options.length > 0 || oldValue.length > 0)) {
          console.log('bd-select.options', _options, oldValue);
          let _mutation = false;
          for (let i = 0; i < this.currentValue.length; i++) {
            const value = this.currentValue[i];
            const findIdx = _options.findIndex(p => p.value === value);
            if (findIdx === -1) {
              this.currentValue.splice(findIdx, 1);
              i--;
              _mutation = true;
            }
          }
          if (_mutation) {
            this.$emit('input', JSON.parse(JSON.stringify(this.currentValue)));
          }
        }
      },
      deep: true
    }
    // options(val) {
    // },
    // 'elSelect': {
    //     handler(val) {
    //         console.log('elSelect.options:change', val);
    //         // this.options = JSON.parse(JSON.stringify(val));
    //     },
    //     deep: true
    // }
  },
  created() {
    //初始化tags
    this.$nextTick(() => {
      this.elSelect = this.$refs.select;
      // this.currentValue.forEach(value => {
      //     this.initTags.push({
      //         label: this.$refs.select.getOption(value).label,
      //         value: this.$refs.select.getOption(value).value
      //     });
      // });
    });
  },
  methods: {
    change(val) {
      this.$emit('input', JSON.parse(JSON.stringify(this.currentValue)));
      this.$emit('change', val);
      this.dispatch('ElFormItem', 'el.form.change', val);
    },
    visibleChange(val) {
      this.$emit('visible-change', val);
    },
    removeTag(component) {
      this.$emit('remove-tag', component.value);
    },
    clear() {
      this.$emit('clear');
    },

    popoverTagRemove(tag) {
      this.currentValue.splice(this.currentValue.findIndex(val => val === tag.value), 1);
      this.$refs.select.$emit('change', JSON.parse(JSON.stringify(this.currentValue)));
    },

    clearAllTags() {
      this.currentValue = [];
      this.$refs.select.$emit('change', []);
    },

    selectClick() {
      if (this.disabled) return;
      if (this.visible) {
        this.visible = false;
        this.$refs.select.handleClose();
      } else {
        this.visible = true;
        this.$refs.select.toggleMenu();
      }
    },

    iconClick() {
      if (!this.disabled) {
        this.$emit('icon-click');
      }
    }
  }
};
</script>

<style lang="scss">
.bd-select {
  position: relative;
  display: inline-block;
  width: 100%;
  left: 1px;
  .single {
    .el-select__tags {
      width: 100%;
    }
  }
  .el-select__tags {
    // width: 100%;
    white-space: nowrap;
    text-align: center;
    overflow: hidden; // width: 100%;
    // position: relative;
    left: 2px;
  }
  .el-select__input {
    // width: 100% !important;
    // position: absolute;
    // top: 0;
    // right: 0;
    // bottom: 0;
    // left: 0;
  }
  &__popover {
    border-radius: 4px;
    border: 0;
    padding: 0 10px;
    &__title {
      height: 30px;
      line-height: 30px;
      margin-left: -10px;
      margin-right: -10px;
      margin-bottom: 6px;
      color: #40484f;
      font-size: 12px;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: #dfe4ed;
      }
      &__lt {
        float: left;
        height: 30px;
        line-height: 30px;
        padding-left: 10px;
        position: relative;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background: #7699ff;
          z-index: 1;
        }
        .left {
          font-weight: bold;
        }
      }
      &__rt {
        float: right;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        i {
          cursor: pointer;
        }
      }
    }
    .el-tag {
      margin: 4px;
    }
  }
  &__total {
    position: absolute;
    bottom: 1px;
    right: 30px;
    height: 28px;
    line-height: 28px;
    color: #619ef2;
    font-size: 12px;
    border-radius: 4px;
    z-index: 1;
    padding-left: 5px;
    background: #fff;
    cursor: pointer;
  }
  &__icon__wrap {
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
    cursor: pointer;
    color: #b4bccc;
  }
  &__icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
  /deep/ .el-input__inner {
    padding: 0px 20px;
  }
}
</style>
