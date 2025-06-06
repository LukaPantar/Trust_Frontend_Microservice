<template>
  <Card class="main-card">
    <div class="container p-6">
      <h1 class="mb-8 text-2xl font-bold">Provider & Stakeholder Management</h1>

      <div>
        <h2 class="mb-3 text-xl font-semibold">Manage Stakeholders</h2>
        <DataTable
          :value="allStakeholders"
          :loading="isLoading"
          responsive-layout="scroll"
          class="custom-table"
          dataKey="did"
        >
          <Column field="did" header="DID" style="width: 30%"></Column>
          <Column field="name" header="Name" style="width: 25%"></Column>
          <Column field="probabilistic_trust" header="Probabilistic Trust" style="width: 20%"></Column>
          <Column header="Actions" style="width: 15%; text-align: center">
            <template #body="slotProps">
              <Button 
                icon="pi pi-trash" 
                class="p-button-danger p-button-rounded p-button-text" 
                @click="handleRemoveStakeholder(slotProps.data.did)" 
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="my-10 border-t border-gray-200"></div>

      <div>
        <h2 class="mb-4 text-xl font-semibold">Create New Stakeholder</h2>

        <Message v-if="alert.show" :severity="alert.type" :closable="true" class="mb-4">
          {{ alert.message }}
        </Message>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label>Stakeholder Type</label>
            <Dropdown 
              v-model="newStakeholder.type" 
              :options="stakeholderTypes" 
              optionLabel="text" 
              optionValue="value" 
              placeholder="Select a Type" 
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label>Stakeholder Name</label>
            <InputText 
              v-model="newStakeholder.name" 
              placeholder="Enter stakeholder name" 
            />
          </div>

          <div class="flex flex-col gap-2 md:col-span-2">
            <label>Metrics URL</label>
            <InputText 
              v-model="newStakeholder.metrics_url" 
              placeholder="https://example.com/metrics"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button
            label="Create Stakeholder"
            icon="pi pi-plus"
            :loading="isCreating"
            :disabled="!newStakeholder.type || !newStakeholder.name || !newStakeholder.metrics_url"
            @click="handleCreateStakeholder"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// --- INTERFACES & TYPES ---
interface Stakeholder {
  did: string;
  name: string;
  created_at: string;
  probabilistic_trust: number;
  deterministic_trust: number;
}

type AlertType = 'success' | 'info' | 'warn' | 'error';

// --- STATE MANAGEMENT ---
const allStakeholders = ref<Stakeholder[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);

const newStakeholder = ref({
  type: null as string | null,
  name: '',
  metrics_url: '',
});

const alert = ref({
  show: false,
  type: 'success' as AlertType,
  message: '',
});

// --- CONFIGURATION ---
const evaluatorUrl = import.meta.env.VITE_TRUST_METRIC_EVALUATOR_HOST + ':' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_PORT;

// Map frontend text to backend integer types
// ❗️ VERIFY these integer values match your `StakeholderType` enum in the backend
const stakeholderTypeMap: { [key: string]: number } = {
  resource_provider: 0,
  capacity_provider: 1,
  resource_capacity: 2,
  application_provider: 3,
};

const stakeholderTypes = [
  { text: 'Resource Provider', value: 'resource_provider' },
  { text: 'Capacity Provider', value: 'capacity_provider' },
  { text: 'Resource Capacity Provider', value: 'resource_capacity' },
  { text: 'Application Provider', value: 'application_provider' },
];

// --- METHODS ---
const showAlert = (message: string, type: AlertType = 'success') => {
  alert.value = { show: true, message, type };
  // Auto-hide the alert after 5 seconds
  setTimeout(() => {
    alert.value.show = false;
  }, 5000);
};

const resetForm = () => {
  newStakeholder.value = { type: null, name: '', metrics_url: '' };
};

const fetchStakeholders = async () => {
  isLoading.value = true;
  try {
    // The response.data from your API is the array itself, not an object containing the array
    const response = await axios.get<Stakeholder[]>(`${evaluatorUrl}/stakeholders`);
    allStakeholders.value = response.data;
  } catch (error) {
    console.error('Failed to fetch stakeholders:', error);
    showAlert('Failed to fetch stakeholders.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveStakeholder = async (stakeholderDid: string) => {
  if (!confirm('Are you sure you want to remove this stakeholder?')) return;

  try {
    await axios.delete(`${evaluatorUrl}/stakeholder/${stakeholderDid}`);
    showAlert('Stakeholder removed successfully!', 'success');
    await fetchStakeholders(); // Refresh the list
  } catch (error) {
    console.error('Failed to remove stakeholder:', error);
    const detail = (error as any).response?.data?.detail || 'Failed to remove stakeholder.';
    showAlert(detail, 'error');
  }
};

const handleCreateStakeholder = async () => {
  if (!newStakeholder.value.type || !newStakeholder.value.name || !newStakeholder.value.metrics_url) {
    showAlert('Please fill in all fields.', 'warn');
    return;
  }
  isCreating.value = true;

  // Generate a temporary unique DID using a timestamp
  const newDid = `did:example:${Date.now()}`;
  
  const params = {
    stakeholder_type: stakeholderTypeMap[newStakeholder.value.type],
    name: newStakeholder.value.name,
    metrics_url: newStakeholder.value.metrics_url,
  };
  
  try {
    await axios.post(`${evaluatorUrl}/stakeholder/${newDid}`, null, { params });
    showAlert('Stakeholder created successfully!', 'success');
    resetForm();
    await fetchStakeholders(); // Refresh the list
  } catch (error) {
    console.error('Failed to create stakeholder:', error);
    const detail = (error as any).response?.data?.detail || 'Failed to create stakeholder.';
    showAlert(detail, 'error');
  } finally {
    isCreating.value = false;
  }
};

// --- LIFECYCLE HOOK ---
onMounted(fetchStakeholders);

</script>

<style scoped>
/* Re-using the same custom styles from Users.vue for perfect consistency */
.custom-table .p-datatable {
  font-size: 1.125rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
}

.custom-table .p-datatable-thead > tr > th {
  background-color: #f5f5fa;
  font-weight: 600;
  font-size: 1.25rem;
  padding: 1.2rem;
  border-bottom: 2px solid #ddd;
}

.custom-table .p-datatable-tbody > tr > td {
  padding: 1.4rem;
  font-size: 1.125rem;
}

.custom-table .p-datatable-tbody > tr:nth-child(even) {
  background-color: #fafafa;
}

.main-card {
  border: 1px solid #dcdce5;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}
</style>