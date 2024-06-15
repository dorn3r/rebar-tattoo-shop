<template>
  <div
    class="carousel-container fixed left-5 top-1/2 transform -translate-y-1/2 bg-opacity-70 bg-gray-900 text-white p-6 rounded-lg shadow-lg transition-transform duration-500 ease-in-out"
    :class="{ 'slide-in': hasLoaded }">
    <div class="zone-selector mb-5 w-full">
      <p class="mb-2"><strong>{{ t('tattoo.shop.zone.change') }}</strong></p>
      <select v-model="selectedZone" @change="filterTattoos" class="w-full p-2 bg-gray-700 text-white rounded-md">
        <option value="ZONE_TORSO">{{ t('tattoo.shop.zone.torso') }}</option>
        <option value="ZONE_LEFT_ARM">{{ t('tattoo.shop.zone.left.arm') }}</option>
        <option value="ZONE_RIGHT_ARM">{{ t('tattoo.shop.zone.right.arm') }}</option>
        <option value="ZONE_HEAD">{{ t('tattoo.shop.zone.head') }}</option>
        <option value="ZONE_LEFT_LEG">{{ t('tattoo.shop.zone.left.leg') }}</option>
        <option value="ZONE_RIGHT_LEG">{{ t('tattoo.shop.zone.right.leg') }}</option>
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
        <p><strong>{{ t('tattoo.shop.collection') }}</strong> {{ Tattoos[currentIndex].Collection }}</p>
        <p><strong>{{ t('tattoo.shop.index') }}</strong> {{ currentIndex }}</p>
        <p><strong>{{ t('tattoo.shop.price') }}</strong> {{ filteredTattoos[currentIndex]?.Price }}$</p>
      </div>
      <button @click="next" class="text-white bg-gray-700 rounded-full p-3 mx-2 hover:bg-gray-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L11.586 10 7.293 5.707a1 1 0 011.414-1.414l5 5a1 1 010 1.414l-5 5a1 1 01-1.414 0z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>

    <!-- Lenytható rész -->
    <div class="w-full mt-5" v-if="isenableddropdown">
      <div @click="toggleDropdown" class="cursor-pointer flex items-center justify-between p-2 bg-gray-700 text-white rounded-md">
        <span>{{ t('tattoo.shop.more.options') }}</span>
        <svg :class="{'transform rotate-180': isDropdownOpen}" class="w-5 h-5 transition-transform" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 11.586l4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 010 1.414z"></path>
        </svg>
      </div>
      <div v-if="isDropdownOpen" class="mt-2 p-2 bg-gray-800 rounded-md">
        <button class="delete-tattoo-button p-2 bg-red-600 text-white rounded-md hover:bg-red-700" @click="confirmDelete">{{ t('tattoo.shop.delete.all') }}</button>
      </div>
    </div>

    <!-- Modális ablak -->
  <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-gray-800 justify-center p-5 rounded-lg text-white w-1/3">
      <p class="mb-4">{{ t('tattoo.shop.are.you.sure') }}</p>
      <div class="flex justify-center space-x-4">
        <button class="bg-gray-600 p-2 rounded hover:bg-gray-700" @click="closeModal">{{ t('tattoo.shop.no') }}</button>
        <button class="bg-red-600 p-2 rounded hover:bg-red-700" @click="deleteTattoos">{{ t('tattoo.shop.yes') }}</button>
      </div>
    </div>
  </div>

    <div class="actions mt-5 flex justify-between">
      <button class="close-button p-2 bg-red-600 text-white rounded-md hover:bg-red-700" @click="close">{{ t('tattoo.shop.zone.exit') }}</button>
      <button class="buy-button p-2 bg-green-600 text-white rounded-md hover:bg-green-700" @click="buy">{{ t('tattoo.shop.zone.buy') }}</button>
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
const isDropdownOpen = ref(false);
const showModal = ref(false);
const isenableddropdown = ref(false)

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

  events.on(Tattoshop_Events.WebView.ENABLE_MORE_MENU, handleDropdownRequest);
});

const handleDropdownRequest = (arg) => {
    isenableddropdown.value = arg
    };

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

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const deleteTattoos = () => {
  showModal.value = false;
  events.emitServer(Tattoshop_Events.ToServer.TATTOO_DELETE);
};

const confirmDelete = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
.carousel-container {
  user-select: none;
}

.carousel-container.slide-in {
  transform: translateY(-50%) translateX(0);
}

/* Modális ablak stílusai */
.fixed.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-50 {
  backdrop-filter: blur(2px);
}
</style>
