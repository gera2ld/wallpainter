<template>
  <div
    class="preview"
    ref="preview"
    @wheel="onWheel"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
    @mouseup="onMouseup">
    <img v-if="validSrc" :src="validSrc" :style="getStyle()" />
  </div>
</template>

<script>
export default {
  props: ['src'],
  data() {
    return {
      validSrc: null,
      naturalWidth: 0,
      naturalHeight: 0,
      clientWidth: 0,
      clientHeight: 0,
      x: 0,
      y: 0,
      baseScale: 0,
      scale: 1,
    };
  },
  watch: {
    src: 'onUpdate',
  },
  computed: {
    width() {
      return this.naturalWidth * this.baseScale * this.scale;
    },
    height() {
      return this.naturalHeight * this.baseScale * this.scale;
    },
  },
  methods: {
    onUpdate() {
      this.validSrc = null;
      this.image = null;
      if (this.src) {
        const image = new Image();
        this.image = image;
        image.onload = () => {
          if (this.image === image) {
            this.validSrc = this.src;
            this.naturalWidth = image.naturalWidth;
            this.naturalHeight = image.naturalHeight;
            this.clientWidth = this.$refs.preview.clientWidth;
            this.clientHeight = this.$refs.preview.clientHeight;
            this.baseScale = Math.min(
              this.clientWidth / this.naturalWidth,
              this.clientHeight / this.naturalHeight,
            );
            this.scale = 1;
            this.x = (this.clientWidth - this.width) / 2;
            this.y = (this.clientHeight - this.height) / 2;
          }
        };
        image.src = this.src;
      }
    },
    getStyle() {
      return {
        top: `${this.y | 0}px`,
        left: `${this.x | 0}px`,
        width: `${this.width}px`,
      };
    },
    setPos(x, y) {
      const baseRect = this.$refs.preview.getBoundingClientRect();
      const dw = baseRect.width - this.width;
      const dh = baseRect.height - this.height;
      this.x = Math.min(dw > 0 ? dw / 2 : 0, Math.max(dw, x));
      this.y = Math.min(dh > 0 ? dh / 2 : 0, Math.max(dh, y));
    },
    onWheel(e) {
      if (Math.abs(e.deltaY)) {
        const baseRect = this.$refs.preview.getBoundingClientRect();
        const scale1 = this.scale;
        let scale2 = this.scale + e.deltaY * 0.01;
        scale2 = Math.max(1, Math.min(scale2, 10));
        this.scale = scale2;
        let x = e.clientX - baseRect.left;
        let y = e.clientY - baseRect.top;
        x -= scale2 / scale1 * (x - this.x);
        y -= scale2 / scale1 * (y - this.y);
        this.setPos(x, y);
      }
    },
    onMousedown(e) {
      e.preventDefault();
      this.dragging = {
        x: this.x,
        y: this.y,
        cx: e.clientX,
        cy: e.clientY,
      };
    },
    onMousemove(e) {
      if (!this.dragging) return;
      const dx = e.clientX - this.dragging.cx;
      const dy = e.clientY - this.dragging.cy;
      this.x = this.dragging.x + dx;
      this.y = this.dragging.y + dy;
    },
    onMouseup() {
      this.dragging = null;
      this.setPos(this.x, this.y);
    },
  },
  mounted() {
    this.onUpdate();
  },
};
</script>

<style>
.preview {
  position: relative;
  overflow: hidden;
  > img {
    position: absolute;
  }
}
</style>
