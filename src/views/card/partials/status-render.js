import Vue from 'vue';
export default Vue.component('render-temp', {
  props: {
    item: Object
  },
  methods: {
    handler(val) {
      this.$emit('handler', val);
    }
  },
  render(h) {
    const bind1 = (
      <a title="投放" onClick={this.handler.bind(null, 1)}>
        <i class="iconfont icon-daohang-" />
      </a>
    );
    const bind2 = (
      <a title="报表" onClick={this.handler.bind(null, 2)}>
        <i class="el-icon-tickets" />
      </a>
    );
    const bind3 = (
      <a title="编辑" onClick={this.handler.bind(null, 3)}>
        <i class="el-icon-edit" />
      </a>
    );
    const bind4 = (
      <a title="删除" onClick={this.handler.bind(null, 4)}>
        <i class="el-icon-delete" />
      </a>
    );
    const bind5 = (
      <a title="详情" onClick={this.handler.bind(null, 5)}>
        <i class="el-icon-document" />
      </a>
    );
    const bind6 = (
      <a title="复制" onClick={this.handler.bind(null, 6)}>
        <i class="iconfont icon-wxcard-copy" />
      </a>
    );

    const statushtml = (
      <span>
        {bind6}
        {bind1}
        {bind2}
        {bind3}
        {bind4}
      </span>
    );
    const overDateHtml = (
      <span>
        <span class="danger">已过期</span>
        {bind6}
        {bind2}
        {bind5}
        {bind4}
      </span>
    );
    const noputonStatushtml = (
      <span>
        {bind6}
        {bind2}
        {bind3}
        {bind4}
      </span>
    );
    const statusNostockhtml = noputonStatushtml;
    const statusFaildhtml = (
      <span>
        {bind6}
        {bind3}
        {bind4}
      </span>
    );
    const _html = this.item.cardEffectiveMode == 0 && this.item.endDate < Date.now() ? overDateHtml : statushtml;
    let failMsg = '';
    if (this.item.autingFaildMsg) {
      failMsg = '：' + this.item.autingFaildMsg;
      if (this.item.autingFaildMsg.length > 8) {
        failMsg = (
          <el-popover placement="top-start" title="" width="200" trigger="hover" content={this.item.autingFaildMsg}>
            <span class="danger-color" slot="reference">
              ：{this.item.autingFaildMsg.substring(0, 8) + '...'}
            </span>
          </el-popover>
        );
      }
    }

    if (this.item.cardEffectiveMode == 0 && this.item.endDate < Date.now()) {
      return <div class="fr">{overDateHtml}</div>;
    }

    if (this.item.auditingStatus === 0) {
      return (
        <div class="fr">
          <span class="green">审核中</span>
        </div>
      );
    } else if (this.item.auditingStatus === -1) {
      return (
        <div class="fr">
          <span class="danger-color">
            审核失败{failMsg}
            {statusFaildhtml}
          </span>
        </div>
      );
    } else if (this.item.auditingStatus === -2) {
      return (
        <div class="fr">
          <span class="danger-color">
            更新失败{failMsg}
            {_html}
          </span>
        </div>
      );
    } else if (this.item.useCustomCode == 1 && this.item.customCodeSync == 1) {
      return (
        <div class="fr">
          <span class="danger-color">正在上传卡券Code</span>
        </div>
      );
    } else if (this.item.stock === 0) {
      return <div class="fr">{statusNostockhtml}</div>;
    } else if (this.item.cardLimit && this.item.cardLimit == 1) {
      return <div class="fr">{_html}</div>;
    } else {
      return <div class="fr">{noputonStatushtml}</div>;
    }
  }
});
