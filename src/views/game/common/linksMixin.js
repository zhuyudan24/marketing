import links from './links';
export default {
  components: {
    links
  },
  data() {
    return {
      linkShow: false,
      linksObj: {},
      gameTypeName: ''
    };
  },
  methods: {
    setLinks(row, index) {
      switch (index) {
        case 1:
          this.gameTypeName = '大转盘';
          break;
        case 2:
          this.gameTypeName = '刮刮卡';
          break;
        case 3:
          this.gameTypeName = '拼图游戏';
          break;
        case 4:
          this.gameTypeName = '找你马';
          break;
        case 5:
          this.gameTypeName = '口令福利';
          break;
      }
      this.linksObj = row;
      this.linkShow = true;
    }
  }
};
