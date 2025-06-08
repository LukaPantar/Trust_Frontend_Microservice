<template>
  <Card class="main-card">
    <div class="container p-6">
      <h1 class="mb-8 text-2xl font-bold">Provider & Stakeholder Management</h1>

      <Message v-if="generalAlert.show" :severity="generalAlert.type" :closable="true" class="mb-4">
        {{ generalAlert.message }}
      </Message>

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
          <Column field="deterministic_trust" header="Deterministic Trust" style="width: 20%"></Column>
          <Column field="created_at" header="Created At" style="width: 20%"></Column>
          <Column header="Actions" style="width: 15%; text-align: center">
            <template #body="slotProps">
              <Button 
                icon="pi pi-trash" 
                class="p-button-danger p-button-rounded p-button-text" 
                @click="handleRemoveStakeholder(slotProps.data.did)" 
              />
            </template>
          </Column>
          <template #empty>
            <div class="p-4 text-center text-gray-500">No stakeholders found. Start by creating a new one below!</div>
          </template>
        </DataTable>
      </div>

      <div class="my-10 border-t border-gray-200"></div>

      <div>
        <h2 class="mb-4 text-xl font-semibold">Create New Stakeholder</h2>

        <Message v-if="createFormAlert.show" :severity="createFormAlert.type" :closable="true" class="mb-4">
          {{ createFormAlert.message }}
        </Message>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col"> 
            <label for="stakeholderType" class="mb-2">Stakeholder Type </label>
            <Dropdown 
              id="stakeholderType"
              v-model="newStakeholder.type" 
              :options="stakeholderTypes" 
              optionLabel="text" 
              optionValue="value" 
              placeholder="Select a Type" 
              class="w-full"
            />
          </div>

          <div class="flex flex-col">
            <label for="stakeholderName" class="mb-2">Stakeholder Name </label>
            <InputText 
              id="stakeholderName"
              v-model="newStakeholder.name" 
              placeholder="Enter stakeholder name" 
            />
          </div>

          <div v-if="requiresMetrics" class="flex flex-col md:col-span-2">
            <label for="metricsUrl" class="mb-2">Metrics URL </label>
            <InputText 
              id="metricsUrl"
              v-model="newStakeholder.metrics_url" 
              placeholder="https://example.com/metrics"
            />
          </div>

          <div v-if="requiresProvider" class="flex flex-col md:col-span-2">
            <label for="providerDid" class="mb-2">Provider DID <span class="text-red-500">*</span></label>
            <InputText 
              id="providerDid"
              v-model="newStakeholder.provider_did" 
              placeholder="Enter Provider DID (e.g., did:example:provider1)"
            />
          </div>
          </div>

        <div class="mt-8 flex justify-end">
          <Button
            label="Create Stakeholder"
            icon="pi pi-plus"
            :loading="isCreating"
            :disabled="!isFormValid"
            @click="handleCreateStakeholder"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'; // Import computed
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
  provider_did: '' // NEW: Add provider_did to newStakeholder
});

// Separate alerts for better UX
const generalAlert = ref({ // For actions like removal
  show: false,
  type: 'success' as AlertType,
  message: '',
});

const createFormAlert = ref({ // For messages related to the creation form
  show: false,
  type: 'success' as AlertType,
  message: '',
});


// --- CONFIGURATION ---
const evaluatorUrl = import.meta.env.VITE_TRUST_METRIC_EVALUATOR_HOST + ':' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_PORT;

// Map frontend text to backend integer types
// ❗️ VERIFY these integer values match your StakeholderType enum in the backend
const stakeholderTypeMap: { [key: string]: number } = {
  resource_provider: 0,
  resource_capacity: 1,
  application_provider: 2,
  resource: 3,
  capacity_provider: 4
};

const stakeholderTypes = [
  { text: 'Resource Provider', value: 'resource_provider' },
  { text: 'Resource Capacity', value: 'resource_capacity' },
  { text: 'Application Provider', value: 'application_provider' },
  { text: 'Resource', value: 'resource' },
  { text: 'Resource Capacity Provider', value: 'capacity_provider' },
];
// --- COMPUTED PROPERTIES ---

const requiresMetrics = computed(() => {
  const selectedType = newStakeholder.value.type;
  return selectedType === 'resource_capacity' || selectedType === 'resource'; 
});

const requiresProvider = computed(() => {
  const selectedType = newStakeholder.value.type;
  return selectedType === 'resource_capacity' || selectedType === 'resource'; 
});

// NEW: Dynamic form validation based on requiresProvider
const isFormValid = computed(() => {
  const baseValid = newStakeholder.value.type && newStakeholder.value.name;
  if (requiresMetrics.value) {
    return baseValid && newStakeholder.value.metrics_url; // Provider DID is required
  }
  if (requiresProvider.value) {
    return baseValid && newStakeholder.value.provider_did; // Provider DID is required
  }
  return baseValid; // Not required
});


// --- METHODS ---
const showAlert = (message: string, type: AlertType = 'success', targetAlert: 'general' | 'createForm' = 'general') => {
  const alertToUpdate = targetAlert === 'general' ? generalAlert : createFormAlert;
  alertToUpdate.value = { show: true, message, type };
  setTimeout(() => {
    alertToUpdate.value.show = false;
  }, 5000);
};

const resetForm = () => {
  newStakeholder.value = { type: null, name: '', metrics_url: '', provider_did: '' }; // Reset provider_did
  createFormAlert.value.show = false; // Hide create form alert on reset
};

const fetchStakeholders = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${evaluatorUrl}/stakeholders`);
    allStakeholders.value = response.data.stakeholders; 
  } catch (error) {
    console.error('Failed to fetch stakeholders:', error);
    showAlert('Failed to fetch stakeholders. Check console for details.', 'error', 'general');
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveStakeholder = async (stakeholderDid: string) => {
  if (!confirm('Are you sure you want to remove this stakeholder?')) return;

  try {
    await axios.delete(`${evaluatorUrl}/stakeholder/${stakeholderDid}`);
    showAlert('Stakeholder removed successfully!', 'success', 'general');
    await fetchStakeholders(); // Refresh the list
  } catch (error) {
    console.error('Failed to remove stakeholder:', error);
    const detail = (error as any).response?.data?.detail || 'Failed to remove stakeholder.';
    showAlert(detail, 'error', 'general');
  }
};

const handleCreateStakeholder = async () => {
  // Use the new isFormValid computed property for validation
  if (!isFormValid.value) {
    showAlert('Please fill in all required fields.', 'warn', 'createForm');
    return;
  }
  isCreating.value = true;

  const newDid = `did:example:${Date.now()}`;
  
  const params: { [key: string]: any } = { // Define params as an object that can hold any key
    stakeholder_type: stakeholderTypeMap[newStakeholder.value.type!], // Use ! as we've already validated
    name: newStakeholder.value.name,
  };

  // Conditionally add metrics url to params if required
  if (requiresMetrics.value) {
    params.metrics_url = newStakeholder.value.metrics_url;
  }

  // Conditionally add provider_did to params if required
  if (requiresProvider.value) {
    params.provider = newStakeholder.value.provider_did;
  }
  
  try {
    await axios.post(`${evaluatorUrl}/stakeholder/${newDid}`, null, { params });
    showAlert('Stakeholder created successfully!', 'success', 'general');
    resetForm();
    await fetchStakeholders(); // Refresh the list
  } catch (error) {
    console.error('Failed to create stakeholder:', error);
    const detail = (error as any).response?.data?.detail || 'Failed to create stakeholder.';
    showAlert(detail, 'error', 'createForm');
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