<template>
  <div class="card">
    <h1>Provider Dashboard</h1>

    <section>
      <h2>Resources</h2>
      <ul>
        <li v-for="res in resources" :key="res.id">
          {{ res.name }} — Status: {{ res.status }} — Last Eval: {{ res.timestamp }}
        </li>
      </ul>
      <button @click="addResource">Add Resource</button>
    </section>

    <section>
      <h2>Configure Trust Metric</h2>
      <label>
        Metric URL:
        <input v-model="metricUrl" placeholder="https://prometheus.example.com" />
      </label>

      <label>
        DID:
        <input v-model="did" placeholder="Enter existing or leave blank to generate" />
      </label>

      <button @click="saveSettings">Save Settings</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Resource { id: number; name: string; status: string; timestamp: string; }
const resources = ref<Resource[]>([
  { id: 1, name: 'Service A', status: 'Good', timestamp: '2025-05-23T08:00:00Z' },
  { id: 2, name: 'Service B', status: 'Warning', timestamp: '2025-05-23T07:30:00Z' },
]);

const metricUrl = ref('');
const did = ref('');

function addResource() {
  const nextId = resources.value.length + 1;
  resources.value.push({ id: nextId, name: `Service ${nextId}`, status: 'Unknown', timestamp: new Date().toISOString() });
}

function saveSettings() {
  console.log('Metric URL:', metricUrl.value);
  console.log('DID:', did.value);
  alert('Settings saved (mock)');
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

section {
  margin-top: 1.5rem;
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

button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>
