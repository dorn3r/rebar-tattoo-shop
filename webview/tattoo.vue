<template>
  <div
    class="carousel-container fixed left-5 top-1/2 transform -translate-y-1/2 bg-opacity-70 bg-gray-900 text-white p-6 rounded-lg shadow-lg transition-transform duration-500 ease-in-out"
    :class="{ 'slide-in': hasLoaded }">
    <div class="zone-selector mb-5 w-full">
      <p class="mb-2"><strong>{{ t('tatto.shop.zone.change') }}</strong></p>
      <select v-model="selectedZone" @change="filterTattoos" class="w-full p-2 bg-gray-700 text-white rounded-md">
        <option value="ZONE_TORSO">{{ t('tatto.shop.zone.torso') }}</option>
        <option value="ZONE_LEFT_ARM">{{ t('tatto.shop.zone.left.arm') }}</option>
        <option value="ZONE_RIGHT_ARM">{{ t('tatto.shop.zone.right.arm') }}</option>
        <option value="ZONE_HEAD">{{ t('tatto.shop.zone.head') }}</option>
        <option value="ZONE_LEFT_LEG">{{ t('tatto.shop.zone.left.leg') }}</option>
        <option value="ZONE_RIGHT_LEG">{{ t('tatto.shop.zone.right.leg') }}</option>
        <!-- Add more options here if needed -->
      </select>
    </div>

    <div class="carousel-content flex items-center justify-between w-full">
      <button @click="prev" class="text-white bg-gray-700 rounded-full p-3 mx-2 hover:bg-gray-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.707 14.707a1 1 0 010-1.414L8.414 10l4.293-4.293a1 1 0 00-1.414-1.414l-5 5a1 1 0 000 1.414l5 5a1 1 0 001.414 0z" clip-rule="evenodd"></path>
        </svg>
      </button>
      <div class="tattoo-details mx-4 w-full text-center">
        <p><strong>{{ t('tatto.shop.collection') }}</strong> {{ Tattoos[currentIndex].Collection }}</p>
        <p><strong>{{ t('tatto.shop.index') }}</strong> {{ Tattoos[currentIndex].Name }}</p>
        <p><strong>{{ t('tatto.shop.price') }}</strong> {{ filteredTattoos[currentIndex]?.Price }}$</p>
      </div>
      <button @click="next" class="text-white bg-gray-700 rounded-full p-3 mx-2 hover:bg-gray-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L11.586 10 7.293 5.707a1 1 0 011.414-1.414l5 5a1 1 010 1.414l-5 5a1 1 01-1.414 0z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>

    <div class="actions mt-5 flex justify-between">
      <button class="close-button p-2 bg-red-600 text-white rounded-md hover:bg-red-700" @click="close">{{ t('tatto.shop.zone.exit') }}</button>
      <button class="buy-button p-2 bg-green-600 text-white rounded-md hover:bg-green-700" @click="buy">{{ t('tatto.shop.zone.buy') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { useEvents } from '@Composables/useEvents';

import { useTranslate } from '@Shared/translate';
import '../translate/index';
import { Tattoshop_Events } from '../shared/events';
import { Tattoos } from '../shared/tattoos';
const { t } = useTranslate('en');

const events = useEvents();
const selectedZone = ref('Torso');
const filteredTattoos = ref([]);
const currentIndex = ref(0);
const hasLoaded = ref(false);

onMounted(() => {
  // Move Camera (Holding LMB)
  document.addEventListener("mousedown", (e) => {
    events.emitClient("CAMERA_MOVE_START");
  });

  document.addEventListener("mouseup", (e) => {
    events.emitClient("CAMERA_MOVE_END");
  });

  // Zoom In & Out (Mousewheel)
  document.addEventListener("wheel", (e) => {
    if (e.deltaY < 0) {
      events.emitClient("CAMERA_SCROLL_UP");
    } else if (e.deltaY > 0) {
      events.emitClient("CAMERA_SCROLL_DOWN");
    }
  });
});

const filterTattoos = () => {
  filteredTattoos.value = Tattoos.filter(tattoo => tattoo.Zone === selectedZone.value);
  currentIndex.value = 0;
};

const prev = () => {
  if (filteredTattoos.value.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + filteredTattoos.value.length) % filteredTattoos.value.length;
    logCurrentTattooData();
  }
};

const next = () => {
  if (filteredTattoos.value.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % filteredTattoos.value.length;
    logCurrentTattooData();
  }
};

const logCurrentTattooData = () => {
  const currentTattoo = filteredTattoos.value[currentIndex.value];
  events.emitClient(Tattoshop_Events.WebView.TATTOO_PREVIEW, currentTattoo);
};

const close = () => {
  events.emitClient(Tattoshop_Events.WebView.CLOSE);
};

const buy = () => {
  const currentTattoo = filteredTattoos.value[currentIndex.value];
  events.emitClient(Tattoshop_Events.ToServer.TATTOO_BUY, currentTattoo);
};
</script>

<style scoped>
.carousel-container {
  user-select: none;
}

.carousel-container.slide-in {
  transform: translateY(-50%) translateX(0);
}
</style>