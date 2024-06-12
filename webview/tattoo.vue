<script setup lang="ts">
import tattoos from '../shared/tattoos';
import { ref, onMounted } from 'vue';
import { useEvents } from '@Composables/useEvents';

import { useTranslate } from '@Shared/translate';
import '../translate/index';
const { t } = useTranslate('en');

const events = useEvents();
const selectedZone = ref('');
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
  filteredTattoos.value = tattoos.filter(tattoo => tattoo.Zone === selectedZone.value);
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
  events.emitClient('tattoshop:preview', currentTattoo);
};

const close = () => {
  events.emitClient('tattoshop:close');
};

const buy = () => {
  const currentTattoo = filteredTattoos.value[currentIndex.value];
  console.log(currentTattoo.Price);
  events.emitClient('tattoshop:buy', currentTattoo);
};
</script>

<template>
  <div class="carousel-container" :class="{ 'slide-in': hasLoaded }">
    <div class="zone-selector">
      <p><strong>{{t('tatto.shop.zone.change')}}</strong></p>
      <select v-model="selectedZone" @change="filterTattoos">
        <option value="ZONE_TORSO">{{t('tatto.shop.zone.torso')}}</option>
        <option value="ZONE_LEFT_ARM">{{t('tatto.shop.zone.left.arm')}}</option>
        <option value="ZONE_RIGHT_ARM">{{t('tatto.shop.zone.right.arm')}}</option>
        <option value="ZONE_HEAD">{{t('tatto.shop.zone.head')}}</option>
        <option value="ZONE_LEFT_LEG">{{t('tatto.shop.zone.left.leg')}}</option>
        <option value="ZONE_RIGHT_LEG">{{t('tatto.shop.zone.right.leg')}}</option>
        <!-- Add more options here if needed -->
      </select>
    </div>
    
    <div class="carousel-content">
      <button @click="prev"><</button>
      <div class="tattoo-details">
        <p><strong>{{t('tatto.shop.index')}}</strong> {{ currentIndex }}</p>
        <p><strong>{{t('tatto.shop.price')}}</strong> {{ filteredTattoos[currentIndex]?.Price }}</p>
      </div>
      <button @click="next">></button>
    </div>

    <div class="actions">
      <button class="close-button" @click="close">{{t('tatto.shop.zone.exit')}}</button>
      <button class="buy-button" @click="buy">{{t('tatto.shop.zone.buy')}}</button>
    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: black;
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 5.5s ease-in-out;
}

.carousel-container.slide-in {
  transform: translateY(-50%) translateX(0);
}

.carousel-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tattoo-details {
  width: calc(100% - 80px); /* Az elemek közötti tér figyelembevételével a tartalom szélessége */
  margin: 0 auto; /* Automatikus margó a tartalom középre igazításához */
}

.zone-selector {
  margin-bottom: 20px;
  width: 100%; /* Hozzáadott szélesség beállítása */

}

.tattoo-details {
  margin: 0 20px;
  width: 100%; /* Hozzáadott szélesség beállítása */

}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  
}

.buy-button{
  padding: 10px 20px;
  margin: 10px;
  background-color: #30a119;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-button {
  padding: 10px 20px;
  margin: 10px;
  background-color: #be2727;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

select {
  padding: 10px;
  margin-right: 20px;
  background-color: #3b3737;
  border: none;
  border-radius: 5px;
}

button:hover,
select:hover {
  background-color: #555050;
}
</style>
