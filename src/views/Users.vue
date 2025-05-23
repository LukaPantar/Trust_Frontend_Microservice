<template>
  <div class="card">
    <h1>Users Dashboard</h1>

    <label>
      Min Trust Filter:
      <input type="number" v-model.number="minTrust" placeholder="0-100" />
    </label>

    <ul>
      <li v-for="res in filteredResources" :key="res.id">
        {{ res.name }} — Trust: {{ res.trust }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Resource { id: number; name: string; trust: number; }
const allResources = ref<Resource[]>([
  { id: 1, name: 'Service A', trust: 85 },
  { id: 2, name: 'Service B', trust: 60 },
  { id: 3, name: 'Service C', trust: 95 },
]);

const minTrust = ref(0);
const filteredResources = computed(() =>
  allResources.value.filter(r => r.trust >= minTrust.value)
);
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

input {
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
</style>
