const { buildStaticUrl } = require('../../utils/config.js')

Component({
  properties: {
    modelSrc: {
      type: String,
      value: buildStaticUrl('/uploads/xr-demo/cool-star.glb')
    }
  },
  data: {},
  methods: {}
});
