<template>
  <div class="content flex-auto" v-if="store.images" @scroll="checkMore" ref="scrollArea">
    <div class="columns">
      <div
        v-for="(item, index) in store.images.rows"
        :key="index"
        class="column col-3"
        @mouseenter="hovered = item"
        @mouseleave="hovered = null">
        <div class="image">
          <div
            class="image-bg"
            :class="{disabled: item.status === 1}"
            :style="{backgroundImage: `url(${getThumbSrc(item)})`}"
            @click="onShow(index)">
          </div>
          <div
            class="label label-ghost label-xs image-tag"
            v-text="item.source"
            @click="onSetSource(item.source)"
          />
          <div class="image-buttons p-1" v-if="hovered === item">
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
    <div v-if="loading" class="divider text-center" data-content="Loading..."></div>
    <div v-if="!loading && !hasMore" class="divider text-center" data-content="The end"></div>
    <div class="modal" :class="{active: activeIndex >= 0}">
      <div class="modal-container">
        <div class="modal-body" v-if="activeItem">
          <div class="d-flex flex-column h-100">
            <header class="d-flex" @click.stop>
              <div class="flex-auto text-gray" v-text="activeItem.key"></div>
              <div>
                <i
                  class="fa mr-2 btn-icon"
                  :class="{0: 'fa-toggle-on', 1: 'fa-toggle-off'}[activeItem.status]"
                  @click="onToggle(activeItem)"
                />
                <i class="fa fa-remove btn-icon" @click="onShow(-1)" />
              </div>
            </header>
            <preview class="flex-auto modal-image" :src="getFullSrc(activeItem)" />
          </div>
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
import Preview from './preview';
import { BASE_URL, store } from './store';
import { rpc, loadMore } from './service';

export default {
  components: {
    Preview,
  },
  data() {
    return {
      store,
      hovered: null,
      activeIndex: -1,
      loading: false,
    };
  },
  computed: {
    hasMore() {
      return this.store.search.offset < this.store.images.total;
    },
    activeItem() {
      const { rows } = this.store.images;
      return rows && rows[this.activeIndex];
    },
  },
  watch: {
    'store.images.total': 'checkMore',
  },
  methods: {
    getThumbSrc(item) {
      return `${BASE_URL}/images/big/${item.key}`;
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
      return this.store.images.rows && this.activeIndex < this.store.images.rows.length - 1;
    },
    onPrev() {
      if (this.hasPrev()) this.activeIndex -= 1;
    },
    onNext() {
      if (this.hasNext()) this.activeIndex += 1;
    },
    async checkMore() {
      const { scrollArea } = this.$refs;
      if (this.loading || !scrollArea) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      if (scrollTop + clientHeight + 100 >= scrollHeight) {
        this.loading = true;
        await loadMore();
        this.loading = false;
      }
    },
    onSetSource(source) {
      this.$emit('setSource', source);
    },
  },
};
</script>

<style>
.content {
  padding: 8px;
  overflow: auto;
  border: 1px solid #888;
}
.image {
  position: relative;
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
  &-bg {
    padding-bottom: calc(9 / 16 * 100%);
    background-color: #eee;
    background-size: cover;
    background-position: center;
    &.disabled {
      filter: opacity(.5);
    }
  }
  &-tag {
    display: inline-block;
    margin: .2rem;
    margin-left: 0;
    cursor: default;
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
</style>
