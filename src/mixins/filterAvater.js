export default {
  data() {
    return {
      // eslint-disable-next-line
      defaultAvatar: require('../assets/img/head_default.png')
    };
  },
  methods: {
    filterAvatar(img) {
      return img ? img.replace(/^http(s)?/, 'https') : this.defaultAvatar;
    }
  }
};
