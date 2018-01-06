<template>
  <div class="container grid-lg">
    <header class="navbar">
      <section class="navbar-section">
        <h1>WallPainter</h1>
      </section>
      <section class="navbar-section">
        <i class="fa fa-refresh btn-icon" @click="onRefresh" />
      </section>
    </header>
    <div class="content" v-if="store.images">
      <div class="columns">
        <div
          v-for="(item, index) in store.images.rows"
          class="column col-3"
          @mouseenter="hovered = item"
          @mouseleave="hovered = null">
          <div class="image">
            <img
              class="img-responsive"
              :class="{disabled: item.status === 1}"
              :src="getThumbSrc(item)"
              @click="onShow(index)"
            />
            <div class="image-buttons p-2" v-if="hovered === item">
              <i class="fa fa-arrows-alt btn-icon" @click="onShow(index)" />
              <i
                class="fa ml-2 btn-icon"
                :class="{0: 'fa-toggle-on', 1: 'fa-toggle-off'}[item.status]"
                @click="onToggle(item)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="mt-2 text-gray">
      Designed and built with <span class="text-error">&hearts;</span> by Gerald
    </footer>
    <div class="modal" :class="{active: activeIndex >= 0}" @click="onShow(-1)">
      <div class="modal-container">
        <div class="modal-body">
          <div class="modal-image" v-if="activeIndex >= 0" :style="{backgroundImage: `url(${getFullSrc(store.images.rows[activeIndex])})`}" />
          <div
            class="modal-button modal-button-left btn-icon"
            :class="{disabled: !hasPrev()}"
            @click.stop="onPrev">
            <i class="fa fa-angle-left" />
          </div>
          <div
            class="modal-button modal-button-right btn-icon"
            :class="{disabled: !hasNext()}"
            @click.stop="onNext">
            <i class="fa fa-angle-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BASE_URL, store } from './store';
import { rpc, updateList } from './service';

export default {
  data() {
    return {
      store,
      hovered: null,
      activeIndex: -1,
    };
  },
  methods: {
    getThumbSrc(item) {
      return `${BASE_URL}/images/full/${item.key}`;
    },
    getFullSrc(item) {
      return `${BASE_URL}/images/full/${item.key}`;
    },
    async onToggle(item) {
      const { status } = item;
      item.status = 1 - status;
      try {
        await rpc('setItem', [item.key, { status: item.status }]);
      } catch (err) {
        console.error(err);
        item.status = status;
      }
    },
    onShow(index) {
      this.activeIndex = index;
    },
    hasPrev() {
      return this.activeIndex > 0;
    },
    hasNext() {
      return this.activeIndex < this.store.images.rows.length - 1;
    },
    onPrev() {
      if (this.hasPrev()) this.activeIndex -= 1;
    },
    onNext() {
      if (this.hasNext()) this.activeIndex += 1;
    },
    onRefresh: updateList,
  },
};
</script>

<style>
.flex-column {
  flex-direction: column;
}
.flex-auto {
  flex: auto;
}
.content {
  min-height: 540px;
  border: 1px solid #888;
}
img.disabled {
  filter: opacity(.5);
}
.image {
  position: relative;
  height: 180px;
  margin-bottom: 10px;
  overflow: hidden;
  &-buttons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: right;
    background: rgba(0,0,0,.7);
    color: white;
  }
}
.modal.active .modal-container {
  width: 90%;
  height: 90%;
  max-width: 90%;
  .modal-body {
    position: relative;
    height: 100%;
    max-height: none;
  }
}
.modal-image {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
}
.modal-button {
  position: absolute;
  width: 48px;
  height: 48px;
  top: 50%;
  margin-top: -24px;
  font-size: 32px;
  text-align: center;
  color: white;
  background: rgba(0,0,0,.4);
  &-left {
    left: 0;
  }
  &-right {
    right: 0;
  }
}
.btn-icon {
  opacity: .8;
  &.disabled {
    opacity: .25;
  }
  &:not(.disabled):hover {
    opacity: 1;
  }
}
</style>
