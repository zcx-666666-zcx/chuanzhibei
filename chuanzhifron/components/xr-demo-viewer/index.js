const { buildStaticUrl } = require('../../utils/config.js')

Component({
  properties: {
    modelSrc: {
      type: String,
      value: buildStaticUrl('/uploads/3D/ancient-stone-stele.glb')
    }
  },
  data: {},
  methods: {}
});
